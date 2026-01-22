import { supabase } from '../lib/supabase';

export const documentService = {
  // GET: Primary CV
  getPrimaryCV: async (userId) => {
    const { data, error } = await supabase
      .from('candidate_documents')
      .select('*')
      .eq('candidate_id', userId)
      .eq('document_type', 'cv')
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  // DELETE: Storage + DB
  deleteCV: async (userId, storagePath) => {
    // 1. Delete from Storage
    if (storagePath) {
      await supabase.storage.from('resumes').remove([storagePath]);
    }

    // 2. Delete from Database
    const { error } = await supabase
      .from('candidate_documents')
      .delete()
      .eq('candidate_id', userId)
      .eq('document_type', 'cv');

    if (error) throw error;
  },

  // UPLOAD: Conflict-safe
  uploadCV: async (userId, file) => {
    const fileExt = file.name.split('.').pop();
    const storagePath = `${userId}/cv-${Date.now()}.${fileExt}`;

    // 1. Upload to Storage
    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(storagePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(storagePath);

    // 2. Upsert Record (Prevents 409 and 400 errors)
    const { data, error: dbError } = await supabase
      .from('candidate_documents')
      .upsert({
        candidate_id: userId,
        document_type: 'cv',
        file_name: file.name,
        file_url: publicUrl,
        storage_path: storagePath, // We just added this column to the DB
        is_primary: true,
        updated_at: new Date().toISOString()
      }, { onConflict: 'candidate_id, document_type' }) 
      .select()
      .single();

    if (dbError) throw dbError;

    // 3. Trigger Edge Function (AI Analysis)
    try {
      await supabase.functions.invoke('analyze-resume', {
        body: { userId, fileUrl: publicUrl, documentId: data.id }
      });
    } catch (e) {
      console.warn("AI Function call failed, but upload succeeded.");
    }

    return data;
  }
};
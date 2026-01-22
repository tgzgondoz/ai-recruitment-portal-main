import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export const candidateService = {
  async getAllJobs() {
    try {
      const { data, error } = await supabase
        .from('job_listings')
        .select(`
          *,
          company:companies(name, logo_url),
          agents:posted_by_id (full_name)
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return [];
    }
  },

  async applyToJob(candidateId, jobId, documentId) {
    try {
      const { data, error } = await supabase
        .from('applications')
        .insert([{
          candidate_id: candidateId,
          job_id: jobId,
          submitted_document_id: documentId,
          status: 'applied',
          source: 'web'
        }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') throw new Error('Already applied!');
        throw error;
      }

      // Trigger AI Analysis
      supabase.functions.invoke('analyze-resume', {
        body: { application_id: data.id }
      });

      toast.success('Applied! AI analysis started.');
      return data;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }
};
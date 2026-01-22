import { supabase } from '../lib/supabase';

export const jobService = {
  // --- Profile Methods ---
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('candidate_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // --- Job Methods (Updated for Companies) ---
  async getJobs() {
    const { data, error } = await supabase
      .from('job_listings') // Switched to job_listings for consistency
      .select('*, company:companies(name, logo_url)')
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // NEW: Fetch all partner companies and their job counts
  async getCompanies() {
    const { data, error } = await supabase
      .from('companies')
      .select(`
        *,
        job_listings (id)
      `);

    if (error) throw error;
    
    return data.map(company => ({
      ...company,
      openJobsCount: company.job_listings?.length || 0
    }));
  },

  async getJobById(id) {
    const { data, error } = await supabase
      .from('job_listings')
      .select('*, company:companies(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // --- Application & Pipeline Methods ---
  async updateApplicationStatus(applicationId, newStatus) {
    const { data, error } = await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
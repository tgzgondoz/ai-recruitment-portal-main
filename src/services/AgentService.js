import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export const agentService = {
  // 1. Fetch Aggregated Stats (Expanded for Analytics Page)
  async getAgentStats(agentId) {
    try {
      if (!agentId) return null;

      const { data, error } = await supabase
        .from('applications')
        .select('status, ats_score')
        .eq('assigned_agent_id', agentId);

      if (error) throw error;

      const total = data?.length || 0;
      
      return {
        totalApplications: total,
        pendingReviews: data?.filter(app => ['applied', 'pending'].includes(app.status)).length || 0,
        interviewsScheduled: data?.filter(app => app.status === 'interviewing').length || 0,
        offersSent: data?.filter(app => app.status === 'offered').length || 0,
        avgAtsScore: total > 0 
          ? Math.round(data.reduce((acc, curr) => acc + (curr.ats_score || 0), 0) / total) 
          : 0
      };
    } catch (error) {
      console.error('Error in getAgentStats:', error);
      return { totalApplications: 0, pendingReviews: 0, interviewsScheduled: 0, offersSent: 0, avgAtsScore: 0 };
    }
  },

  // 2. Fetch Recent Applications
  async getRecentApplications(agentId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          ats_score,
          applied_at,
          job_listings (
            title,
            location_city,
            company:companies(name)
          ),
          candidate_profiles!applications_candidate_id_fkey (
            full_name,
            email,
            skills
          )
        `)
        .eq('assigned_agent_id', agentId) 
        .order('applied_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data?.map(app => ({
        ...app,
        jobs: app.job_listings,
        users: app.candidate_profiles,
      })) || [];
    } catch (error) {
      console.error('Error in getRecentApplications:', error);
      return [];
    }
  },

  // 3. Create a New Job Listing
  async createJob(agentId, jobData) {
    try {
      const { data, error } = await supabase
        .from('job_listings')
        .insert([{
          title: jobData.title,
          description: jobData.description,
          location_city: jobData.location,
          posted_by_id: agentId,
          company_id: jobData.companyId, // Link to the selected company
          salary_range: jobData.salary,
          job_type: jobData.type,
          status: 'open'
        }])
        .select();

      if (error) throw error;
      toast.success('Job listing published!');
      return data;
    } catch (error) {
      toast.error('Failed to publish job');
      throw error;
    }
  }
};
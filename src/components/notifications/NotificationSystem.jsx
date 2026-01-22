import { useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const NotificationSystem = () => {
  const { user, userType } = useAuth();
  const queryClient = useQueryClient();
  const isAgent = userType === 'agent';

  useEffect(() => {
    if (!user) return;

    // Agent watches for new applications, Candidate watches for new jobs
    const tableToWatch = isAgent ? 'applications' : 'job_listings';
    const label = isAgent ? 'New Application' : 'New Job Posted';

    const channel = supabase
      .channel('realtime-updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: tableToWatch },
        async (payload) => {
          console.log(`🔥 ${label} Detected:`, payload);

          // Custom Toast based on role
          toast.success(label, {
            icon: isAgent ? '📩' : '💼',
            position: 'top-right',
            duration: 6000,
          });

          // Refresh the specific data in the background
          queryClient.invalidateQueries(isAgent ? ['applications'] : ['jobs']);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, userType, queryClient]);

  return null;
};

export default NotificationSystem;
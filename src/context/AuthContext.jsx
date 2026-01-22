import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // Will store 'candidate', 'agent', or 'admin'
  const [loading, setLoading] = useState(true);

  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "masogashie@gmail.com";

  const fetchUserProfile = async (userId, userEmail) => {
    try {
      // 1. Hardcoded override for your Admin email
      if (userEmail === ADMIN_EMAIL) {
        setUserType('admin');
        return;
      }

      // 2. Fetch from the 'profiles' table (matching your schema)
      const { data, error } = await supabase
        .from('profiles')
        .select('role') // We renamed user_type to role in your schema fix
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      // Use the 'role' column from your schema
      setUserType(data?.role || 'candidate');
    } catch (err) {
      console.error("Profile Fetch Error:", err.message);
      // Default to candidate if profile doesn't exist yet
      setUserType('candidate');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check active sessions on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchUserProfile(session.user.id, session.user.email);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchUserProfile(session.user.id, session.user.email);
      } else {
        setUser(null);
        setUserType(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      toast.error(error.message);
      return { success: false, error };
    }
  };

  const signUp = async (email, password, metadata) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata // This contains full_name, etc.
        }
      });
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      toast.error(error.message);
      return { success: false, error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
  };

  const switchUserType = (newType) => {
    setUserType(newType);
    toast.success(`Switched to ${newType} view`, {
      icon: '🔄',
      style: { borderRadius: '10px', background: '#333', color: '#fff' }
    });
  };

  const value = {
    user,
    userType,
    loading,
    signIn,
    signUp,
    signOut,
    switchUserType,
    isAgent: userType === 'agent',
    isCandidate: userType === 'candidate',
    isAdmin: userType === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
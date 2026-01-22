import React, { useState } from 'react';
import { 
  FaTimes, FaUserTie, FaEnvelope, FaBuilding, FaPlusCircle,
  FaLock, FaSpinner, FaCheckCircle, FaPhone 
} from 'react-icons/fa';
import { supabase } from '../lib/supabase'; 
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';

const AddAgentModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    company_name: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Form, 2: Success/Password display
  const [generatedPassword, setGeneratedPassword] = useState('');

  if (!isOpen) return null;

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const password = generatePassword();

      // 1. Create Auth User
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: password,
        options: {
          data: {
            full_name: formData.full_name,
            user_type: 'agent'
          }
        }
      });

      if (authError) throw authError;

      // 2. Create Profile Record (Matches your schema columns)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: authData.user.id,
          full_name: formData.full_name,
          email: formData.email,
          company_name: formData.company_name,
          phone: formData.phone,
          role: 'agent',
          updated_at: new Date().toISOString()
        }]);

      if (profileError) throw profileError;

      setGeneratedPassword(password);
      setStep(2);
      onSuccess(); // Refresh the table background
    } catch (error) {
      toast.error(error.message || "Failed to add agent");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    setFormData({ full_name: '', email: '', company_name: '', phone: '' });
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-md">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg">
              {step === 1 ? <FaPlusCircle size={20} /> : <FaCheckCircle size={20} />}
            </div>
            <div>
              <h3 className="font-bold text-gray-900">
                {step === 1 ? 'Register Recruiter' : 'Registration Complete'}
              </h3>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Admin Portal</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-400">
            <FaTimes size={18} />
          </button>
        </div>

        <div className="p-6">
          {step === 1 ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Inputs with high visibility text-gray-900 */}
              {[
                { label: 'Full Name', icon: FaUserTie, key: 'full_name', type: 'text', placeholder: 'John Doe' },
                { label: 'Email Address', icon: FaEnvelope, key: 'email', type: 'email', placeholder: 'agent@company.com' },
                { label: 'Phone Number', icon: FaPhone, key: 'phone', type: 'tel', placeholder: '+1 234 567 890' },
                { label: 'Company Name', icon: FaBuilding, key: 'company_name', type: 'text', placeholder: 'Dimensions AI' }
              ].map((field) => (
                <div key={field.key} className="space-y-1">
                  <label className="text-[11px] font-black text-gray-700 uppercase ml-1">{field.label}</label>
                  <div className="relative">
                    <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      required={field.key !== 'phone'}
                      type={field.type}
                      className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-100 rounded-xl text-gray-900 font-semibold focus:border-blue-500 outline-none transition-all shadow-sm"
                      placeholder={field.placeholder}
                      value={formData[field.key]}
                      onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                    />
                  </div>
                </div>
              ))}

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={onClose} className="flex-1 py-3.5 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl">CANCEL</button>
                <button type="submit" disabled={loading} className="flex-1 py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg active:scale-95 disabled:opacity-50">
                  {loading ? <FaSpinner className="animate-spin mx-auto" /> : "CONFIRM AGENT"}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6 text-center">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs font-bold text-amber-800 uppercase mb-2">Temporary Password</p>
                <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-amber-200 justify-between">
                  <code className="text-gray-900 font-mono font-bold">{generatedPassword}</code>
                  <button onClick={() => {navigator.clipboard.writeText(generatedPassword); toast.success("Copied!");}} className="text-xs bg-amber-100 px-2 py-1 rounded font-bold text-amber-700">COPY</button>
                </div>
                <p className="text-[10px] text-amber-600 mt-2 font-medium">Please share this password securely with the agent.</p>
              </div>
              <button onClick={handleComplete} className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl shadow-xl">DONE</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddAgentModal;
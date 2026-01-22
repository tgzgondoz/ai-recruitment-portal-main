import React, { useState } from 'react';
import { 
  FaTimes, FaUserTie, FaEnvelope, FaBuilding, FaPlusCircle,
  FaLock, FaSpinner, FaCheckCircle, FaPhone, FaCopy
} from 'react-icons/fa';
import { supabase } from '../lib/supabase'; 
import toast from 'react-hot-toast';

const AddAgentModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    company_name: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
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
      onSuccess();
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword);
    toast.success('Password copied to clipboard');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-xl border border-gray-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 text-white rounded-lg flex items-center justify-center">
              {step === 1 ? <FaPlusCircle size={20} /> : <FaCheckCircle size={20} />}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {step === 1 ? 'Add Recruiter' : 'Registration Complete'}
              </h3>
              <p className="text-xs text-gray-500">Admin Portal</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={18} />
          </button>
        </div>

        <div className="p-6">
          {step === 1 ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {[
                { label: 'Full Name', icon: FaUserTie, key: 'full_name', type: 'text', placeholder: 'John Doe' },
                { label: 'Email Address', icon: FaEnvelope, key: 'email', type: 'email', placeholder: 'agent@company.com' },
                { label: 'Phone Number', icon: FaPhone, key: 'phone', type: 'tel', placeholder: '+1 234 567 890' },
                { label: 'Company Name', icon: FaBuilding, key: 'company_name', type: 'text', placeholder: 'Company Name' }
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    {field.label} {field.key !== 'phone' && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      required={field.key !== 'phone'}
                      type={field.type}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all"
                      placeholder={field.placeholder}
                      value={formData[field.key]}
                      onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                    />
                  </div>
                </div>
              ))}

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="flex-1 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 py-3 bg-gray-900 hover:bg-black text-white font-medium rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gray-100 text-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCheckCircle size={28} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Recruiter Added Successfully</h3>
                <p className="text-gray-600">Share these credentials with the new recruiter</p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-900">Temporary Password</span>
                  <button 
                    onClick={copyToClipboard}
                    className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900"
                  >
                    <FaCopy size={14} />
                    Copy
                  </button>
                </div>
                <div className="bg-white border border-gray-300 rounded-lg p-3 font-mono text-gray-900 text-center tracking-wider">
                  {generatedPassword}
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  This password should be changed on first login
                </p>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={handleComplete}
                  className="flex-1 py-3 bg-gray-900 hover:bg-black text-white font-medium rounded-lg transition-colors"
                >
                  Done
                </button>
                <button 
                  onClick={() => {
                    handleComplete();
                    setIsModalOpen(true);
                  }}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition-colors"
                >
                  Add Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddAgentModal;
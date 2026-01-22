import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  FaUser, FaEnvelope, FaLock, FaPhone, FaArrowRight, 
  FaCheck, FaTimes, FaArrowLeft
} from 'react-icons/fa'
import toast from 'react-hot-toast'
import { cn } from '../lib/utils'

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '', email: '', phone: '', password: '', confirm_password: '',
  })
  
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    if (name === 'password') {
      let strength = 0
      if (value.length >= 8) strength += 25
      if (/[A-Z]/.test(value)) strength += 25
      if (/[0-9]/.test(value)) strength += 25
      if (/[^A-Za-z0-9]/.test(value)) strength += 25
      setPasswordStrength(strength)
    }
  }

  const validateForm = () => {
    if (formData.password !== formData.confirm_password) {
      toast.error('Passwords do not match'); return false;
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters'); return false;
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    try {
      const result = await signUp(formData.email, formData.password, {
        full_name: formData.full_name,
        phone: formData.phone,
        user_type: 'candidate', 
      })
      if (result.success) {
        toast.success('Check your email for verification!')
        navigate('/login')
      } else {
        toast.error(result.message || 'Registration failed')
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrengthColor = (strength) => {
    if (strength >= 75) return 'bg-green-500'
    if (strength >= 50) return 'bg-yellow-500'
    if (strength >= 25) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full py-8">
        <Link to="/login" className="inline-flex items-center gap-2 text-xs font-black text-gray-400 hover:text-blue-600 mb-8 transition-colors uppercase tracking-widest">
          <FaArrowLeft /> Back to Login
        </Link>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black text-xl shadow-xl shadow-blue-200">D</div>
            <div className="text-left">
              <h1 className="text-2xl font-black text-gray-900 leading-none">Dimensions</h1>
              <p className="text-gray-500 text-[10px] mt-1 uppercase tracking-[0.2em] font-bold">Candidate Portal</p>
            </div>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Join Today</h2>
          <p className="text-gray-500 font-medium">Start your career journey with AI</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {[
              { label: 'Full Name', icon: FaUser, name: 'full_name', type: 'text', placeholder: 'Enter your name' },
              { label: 'Email Address', icon: FaEnvelope, name: 'email', type: 'email', placeholder: 'name@example.com' },
              { label: 'Phone (Optional)', icon: FaPhone, name: 'phone', type: 'tel', placeholder: '+1 (555) 000-0000' }
            ].map((input) => (
              <div key={input.name}>
                <label className="block text-[10px] font-black text-gray-600 uppercase tracking-wider ml-1 mb-2">{input.label}</label>
                <div className="relative group">
                  <input.icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type={input.type}
                    name={input.name}
                    value={formData[input.name]}
                    onChange={handleChange}
                    required={input.name !== 'phone'}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-100 rounded-2xl text-gray-900 font-bold placeholder:text-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                    placeholder={input.placeholder}
                  />
                </div>
              </div>
            ))}

            <div>
              <label className="block text-[10px] font-black text-gray-600 uppercase tracking-wider ml-1 mb-2">Password</label>
              <div className="relative group">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-100 rounded-2xl text-gray-900 font-bold placeholder:text-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
              {formData.password && (
                <div className="mt-3 px-1">
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div className={cn("h-full transition-all duration-500", getPasswordStrengthColor(passwordStrength))} style={{ width: `${passwordStrength}%` }} />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-600 uppercase tracking-wider ml-1 mb-2">Confirm Password</label>
              <div className="relative group">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-100 rounded-2xl text-gray-900 font-bold placeholder:text-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 mt-4 uppercase text-xs tracking-widest"
            >
              {loading ? <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Create Account</span><FaArrowRight /></>}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-gray-50">
            <p className="text-sm font-bold text-gray-500">
              Already a member?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 underline decoration-2 underline-offset-4">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
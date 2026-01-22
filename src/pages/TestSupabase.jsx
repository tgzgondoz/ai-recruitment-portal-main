import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const TestConnection = () => {
  const navigate = useNavigate()
  const { user, userType, loading, signUp, signIn, signOut } = useAuth()
  const [dbStatus, setDbStatus] = useState({
    users: 0,
    candidate_profiles: 0,
    job_listings: 0,
    applications: 0
  })
  const [testResults, setTestResults] = useState([])
  const [formData, setFormData] = useState({
  email: `test.user.${Date.now()}@example.com`,
  password: 'Test123!',
  fullName: `Test User ${Date.now()}`,
  phone: '1234567890',
  userType: 'candidate',
  location: 'Test City',
  country: 'Test Country'
})

  useEffect(() => {
    checkDatabaseStatus()
  }, [])

  const checkDatabaseStatus = async () => {
    const results = []
    
    try {
      // Check if we can connect to Supabase
      results.push({ step: 'Supabase Connection', status: 'checking' })
      
      // Check each table
      const tables = ['users', 'candidate_profiles', 'job_listings', 'applications']
      
      for (const table of tables) {
        try {
          const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true })
          
          if (error) {
            results.push({ 
              step: `Table: ${table}`, 
              status: 'error', 
              message: error.message 
            })
            setDbStatus(prev => ({ ...prev, [table]: 'error' }))
          } else {
            results.push({ 
              step: `Table: ${table}`, 
              status: 'success', 
              message: `Found ${count} records` 
            })
            setDbStatus(prev => ({ ...prev, [table]: count }))
          }
        } catch (error) {
          results.push({ 
            step: `Table: ${table}`, 
            status: 'error', 
            message: error.message 
          })
        }
      }
      
      // Check storage buckets
      try {
        const { data: buckets, error } = await supabase.storage.listBuckets()
        if (error) {
          results.push({ step: 'Storage Buckets', status: 'error', message: error.message })
        } else {
          const candidateDocs = buckets.find(b => b.name === 'candidate-documents')
          results.push({ 
            step: 'Storage Buckets', 
            status: 'success', 
            message: `Found ${buckets.length} buckets. Candidate docs: ${candidateDocs ? '✅' : '❌'}` 
          })
        }
      } catch (error) {
        results.push({ step: 'Storage Buckets', status: 'error', message: error.message })
      }
      
    } catch (error) {
      results.push({ step: 'Database Connection', status: 'error', message: error.message })
    }
    
    setTestResults(results)
  }

  const handleTestSignUp = async () => {
    const results = []
    
    try {
      results.push({ step: 'Starting Sign Up', status: 'checking' })
      
      // 1. Sign up with Supabase Auth
      results.push({ step: 'Supabase Auth Signup', status: 'checking' })
      const signupResult = await signUp(
        formData.email,
        formData.password,
        {
          userType: formData.userType,
          fullName: formData.fullName,
          phone: formData.phone,
          location: formData.location,
          country: formData.country
        }
      )
      
      if (signupResult.success) {
        results.push({ 
          step: 'Supabase Auth Signup', 
          status: 'success', 
          message: `User created: ${formData.email}` 
        })
        
        // 2. Check if user exists in database
        setTimeout(async () => {
          const { data: dbUser, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', formData.email)
            .single()
          
          if (error) {
            results.push({ 
              step: 'Database User Record', 
              status: 'error', 
              message: error.message 
            })
          } else {
            results.push({ 
              step: 'Database User Record', 
              status: 'success', 
              message: `Found in DB: ${dbUser.full_name} (${dbUser.user_type})` 
            })
            
            // 3. Check candidate profile if applicable
            if (formData.userType === 'candidate') {
              const { data: profile, error: profileError } = await supabase
                .from('candidate_profiles')
                .select('*')
                .eq('user_id', dbUser.id)
                .single()
              
              if (profileError) {
                results.push({ 
                  step: 'Candidate Profile', 
                  status: 'warning', 
                  message: profileError.message 
                })
              } else {
                results.push({ 
                  step: 'Candidate Profile', 
                  status: 'success', 
                  message: 'Profile created successfully' 
                })
              }
            }
          }
          
          setTestResults([...results])
          checkDatabaseStatus() // Refresh counts
        }, 2000)
        
      } else {
        results.push({ 
          step: 'Supabase Auth Signup', 
          status: 'error', 
          message: signupResult.error 
        })
      }
      
    } catch (error) {
      results.push({ 
        step: 'Sign Up Process', 
        status: 'error', 
        message: error.message 
      })
    }
    
    setTestResults(results)
  }

  const handleTestSignIn = async () => {
    const results = []
    
    try {
      results.push({ step: 'Starting Sign In', status: 'checking' })
      
      const signinResult = await signIn(formData.email, formData.password)
      
      if (signinResult.success) {
        results.push({ 
          step: 'Sign In', 
          status: 'success', 
          message: `Logged in as: ${formData.email}` 
        })
      } else {
        results.push({ 
          step: 'Sign In', 
          status: 'error', 
          message: signinResult.error 
        })
      }
      
    } catch (error) {
      results.push({ 
        step: 'Sign In', 
        status: 'error', 
        message: error.message 
      })
    }
    
    setTestResults(results)
  }

  const handleDirectQuery = async () => {
    const results = []
    
    try {
      // Test direct query without going through our auth context
      results.push({ step: 'Direct Supabase Query', status: 'checking' })
      
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1)
      
      if (error) {
        results.push({ 
          step: 'Direct Query', 
          status: 'error', 
          message: error.message 
        })
      } else {
        results.push({ 
          step: 'Direct Query', 
          status: 'success', 
          message: 'Connected successfully' 
        })
      }
      
    } catch (error) {
      results.push({ 
        step: 'Direct Query', 
        status: 'error', 
        message: error.message 
      })
    }
    
    setTestResults(results)
  }

  const StatusIcon = ({ status }) => {
    switch (status) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      default: return '🔄'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Supabase Connection Test</h1>
          <p className="text-gray-600 mt-2">Test your database and authentication setup</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            ← Back to Dashboard
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Status & Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Environment Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Environment Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Supabase URL</p>
                  <p className={`font-mono text-sm truncate ${import.meta.env.VITE_SUPABASE_URL ? 'text-green-600' : 'text-red-600'}`}>
                    {import.meta.env.VITE_SUPABASE_URL || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Anon Key</p>
                  <p className={`font-mono text-sm truncate ${import.meta.env.VITE_SUPABASE_ANON_KEY ? 'text-green-600' : 'text-red-600'}`}>
                    {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current User</p>
                  <p className="font-medium">
                    {user ? `${user.email} (${userType})` : 'Not logged in'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">User ID</p>
                  <p className="font-mono text-sm truncate">{user?.id || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Database Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Database Status</h2>
                <button
                  onClick={checkDatabaseStatus}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Refresh
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {Object.entries(dbStatus).map(([table, count]) => (
                  <div key={table} className="bg-gray-50 p-4 rounded">
                    <p className="text-sm text-gray-600 capitalize">{table.replace('_', ' ')}</p>
                    <p className="text-2xl font-bold">
                      {typeof count === 'number' ? count : count === 'error' ? '❌' : '...'}
                    </p>
                  </div>
                ))}
              </div>

              {/* Test Results */}
              <div className="space-y-3">
                <h3 className="font-semibold">Test Results</h3>
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded">
                    <span className="mt-1">{StatusIcon({ status: result.status })}</span>
                    <div className="flex-1">
                      <p className="font-medium">{result.step}</p>
                      {result.message && (
                        <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      result.status === 'success' ? 'bg-green-100 text-green-800' :
                      result.status === 'error' ? 'bg-red-100 text-red-800' :
                      result.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {result.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Test Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={handleDirectQuery}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Test Direct Connection
                </button>
                
                <button
                  onClick={checkDatabaseStatus}
                  className="w-full px-4 py-3 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Refresh Database Status
                </button>
                
                {user ? (
                  <button
                    onClick={signOut}
                    className="w-full px-4 py-3 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Sign Out
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Go to Login Page
                  </button>
                )}
              </div>
            </div>

            {/* Test Sign Up Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Test Sign Up</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full p-2 border rounded"
                    placeholder="test@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full p-2 border rounded"
                    placeholder="Test123!"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full p-2 border rounded"
                    placeholder="Test User"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">User Type</label>
                  <select
                    value={formData.userType}
                    onChange={(e) => setFormData({...formData, userType: e.target.value})}
                    className="w-full p-2 border rounded"
                  >
                    <option value="candidate">Candidate</option>
                    <option value="agent">Agent</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleTestSignUp}
                    disabled={loading}
                    className="px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Test Sign Up'}
                  </button>
                  
                  <button
                    onClick={handleTestSignIn}
                    disabled={loading}
                    className="px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    Test Sign In
                  </button>
                </div>
                
                <div className="text-xs text-gray-500 mt-4">
                  <p>Tip: The email is auto-generated with timestamp to avoid duplicates.</p>
                  <p>Change it if you want to test with a specific email.</p>
                </div>
              </div>
            </div>

            {/* Database Queries */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Database Queries</h2>
              <div className="space-y-3">
                <button
                  onClick={async () => {
                    const { data, error } = await supabase
                      .from('users')
                      .select('*')
                      .limit(5)
                    
                    if (error) {
                      toast.error(error.message)
                    } else {
                      toast.success(`Found ${data.length} users`)
                      console.log('Users:', data)
                    }
                  }}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  List Users (First 5)
                </button>
                
                <button
                  onClick={async () => {
                    const { data, error } = await supabase
                      .from('job_listings')
                      .select('*')
                      .limit(5)
                    
                    if (error) {
                      toast.error(error.message)
                    } else {
                      toast.success(`Found ${data.length} job listings`)
                      console.log('Jobs:', data)
                    }
                  }}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  List Job Listings
                </button>
                
                <button
                  onClick={async () => {
                    // Check current user's profile
                    if (user) {
                      const { data, error } = await supabase
                        .from('users')
                        .select('*, candidate_profiles(*), agencies(*)')
                        .eq('id', user.id)
                        .single()
                      
                      if (error) {
                        toast.error(error.message)
                      } else {
                        toast.success('Profile loaded')
                        console.log('User Profile:', data)
                      }
                    } else {
                      toast.error('Not logged in')
                    }
                  }}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Check My Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Instructions */}
        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Testing Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-700">
            <li>Click "Test Direct Connection" first to verify Supabase connectivity</li>
            <li>Click "Refresh Database Status" to see table counts</li>
            <li>Use the form to test user registration</li>
            <li>Check the results panel for success/error messages</li>
            <li>Use the Database Queries buttons to inspect data</li>
            <li>Check Supabase Dashboard → Table Editor to verify data creation</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default TestConnection
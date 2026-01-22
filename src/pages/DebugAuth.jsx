import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import toast from 'react-hot-toast'

const DebugAuth = () => {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  // Create direct Supabase client for debugging
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false
      }
    }
  )

  const addResult = (step, status, message) => {
    setResults(prev => [...prev, { step, status, message, timestamp: new Date().toISOString() }])
  }

  const testEmailFormat = async () => {
    setLoading(true)
    setResults([])
    
    // Test different email formats
    const testEmails = [
      'test@example.com',
      'test.user@example.com',
      'test-user@example.com',
      'test_user@example.com',
      'test123@example.com',
      `test${Date.now()}@example.com`,
      `test.${Date.now()}@example.com`
    ]

    for (const email of testEmails) {
      addResult(`Testing email: ${email}`, 'checking', '')
      
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: 'Test123!',
          options: {
            data: { user_type: 'candidate' }
          }
        })

        if (error) {
          addResult(`Email: ${email}`, 'error', error.message)
          
          // Special handling for "already registered"
          if (error.message.includes('already registered')) {
            addResult(`Email: ${email}`, 'warning', 'Email exists, testing sign in')
            
            // Try sign in instead
            const signInResult = await supabase.auth.signInWithPassword({
              email,
              password: 'Test123!'
            })
            
            if (signInResult.error) {
              addResult(`Sign in for: ${email}`, 'error', signInResult.error.message)
            } else {
              addResult(`Sign in for: ${email}`, 'success', 'Logged in successfully')
            }
          }
        } else {
          addResult(`Email: ${email}`, 'success', 'Sign up successful')
          
          // Clean up: sign out
          await supabase.auth.signOut()
        }
      } catch (error) {
        addResult(`Email: ${email}`, 'error', error.message || 'Unknown error')
      }
    }
    
    setLoading(false)
  }

  const testDirectCurl = async () => {
    addResult('Testing direct API call', 'checking', '')
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: `directtest${Date.now()}@example.com`,
          password: 'Test123!'
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        addResult('Direct API call', 'success', JSON.stringify(data, null, 2))
      } else {
        addResult('Direct API call', 'error', JSON.stringify(data, null, 2))
      }
    } catch (error) {
      addResult('Direct API call', 'error', error.message)
    }
  }

  const checkSupabaseSettings = async () => {
    addResult('Checking Supabase settings', 'checking', '')
    
    try {
      // Check if we can query users table
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1)
      
      if (error) {
        addResult('Database query', 'error', error.message)
      } else {
        addResult('Database query', 'success', 'Can connect to database')
      }
      
      // Check auth settings
      const { data: settings, error: settingsError } = await supabase.auth.getSession()
      
      if (settingsError) {
        addResult('Auth session', 'error', settingsError.message)
      } else {
        addResult('Auth session', 'success', 'Auth is configured')
      }
      
    } catch (error) {
      addResult('Settings check', 'error', error.message)
    }
  }

  const resetTest = () => {
    setResults([])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Auth Debug Page</h1>
        
        <div className="mb-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="w-40 font-medium">VITE_SUPABASE_URL:</span>
              <code className="text-sm bg-gray-100 p-1 rounded flex-1 truncate">
                {import.meta.env.VITE_SUPABASE_URL || 'NOT SET'}
              </code>
            </div>
            <div className="flex items-center">
              <span className="w-40 font-medium">VITE_SUPABASE_ANON_KEY:</span>
              <code className="text-sm bg-gray-100 p-1 rounded flex-1 truncate">
                {import.meta.env.VITE_SUPABASE_ANON_KEY ? 
                  `${import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 20)}...` : 
                  'NOT SET'}
              </code>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={testEmailFormat}
            disabled={loading}
            className="p-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Test Email Formats
          </button>
          
          <button
            onClick={testDirectCurl}
            disabled={loading}
            className="p-4 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Test Direct API
          </button>
          
          <button
            onClick={checkSupabaseSettings}
            disabled={loading}
            className="p-4 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            Check Settings
          </button>
        </div>

        <button
          onClick={resetTest}
          className="mb-6 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Clear Results
        </button>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h2 className="text-xl font-semibold">Test Results</h2>
          </div>
          
          <div className="divide-y">
            {results.map((result, index) => (
              <div key={index} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`w-6 h-6 flex items-center justify-center rounded-full ${
                        result.status === 'success' ? 'bg-green-100 text-green-800' :
                        result.status === 'error' ? 'bg-red-100 text-red-800' :
                        result.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {result.status === 'success' ? '✓' :
                         result.status === 'error' ? '✗' :
                         result.status === 'warning' ? '!' : '…'}
                      </span>
                      <span className="font-medium">{result.step}</span>
                    </div>
                    {result.message && (
                      <pre className="mt-2 text-sm bg-gray-50 p-3 rounded overflow-auto">
                        {result.message}
                      </pre>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            
            {results.length === 0 && !loading && (
              <div className="p-8 text-center text-gray-500">
                No tests run yet. Click a button above to start testing.
              </div>
            )}
            
            {loading && (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Running tests...</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 p-6 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Debug Steps</h3>
          <ol className="list-decimal list-inside space-y-2 text-yellow-700">
            <li>Click "Check Settings" first to verify connection</li>
            <li>Click "Test Email Formats" to see which emails work</li>
            <li>If all fail, click "Test Direct API" to bypass the SDK</li>
            <li>Check Supabase Dashboard → Authentication → Settings</li>
            <li>Look for email restrictions or confirm email requirements</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default DebugAuth
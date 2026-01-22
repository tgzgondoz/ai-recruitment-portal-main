import { Link } from 'react-router-dom'
import { FaHome, FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="text-9xl font-bold text-gray-200">404</div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <FaExclamationTriangle className="h-16 w-16 text-red-400" />
            </div>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Page Not Found</h1>
        
        <p className="text-gray-600 mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved to a different location.
        </p>
        
        <div className="space-y-4">
          <Link
            to="/dashboard"
            className="dc-btn-primary inline-flex items-center justify-center gap-2 px-6 py-3"
          >
            <FaHome className="w-4 h-4" />
            Go to Dashboard
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="dc-btn-secondary inline-flex items-center justify-center gap-2 px-6 py-3"
          >
            <FaArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              If you believe this is an error, please{' '}
              <a href="mailto:support@dimensionsconsultancy.com" className="text-brand-primary hover:underline">
                contact support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound
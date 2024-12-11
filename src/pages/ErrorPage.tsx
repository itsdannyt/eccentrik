import { useLocation, useNavigate } from 'react-router-dom';

export function ErrorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const error = location.state?.error || 'An unexpected error occurred';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-8">
            {error}
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}

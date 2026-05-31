import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="text-center py-20">
      <h1 className="text-5xl font-bold text-gray-900 mb-4">
        Shorten your URLs,
        <span className="text-indigo-600"> track every click</span>
      </h1>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
        Create short links with powerful analytics. Track clicks, locations, devices, and more -- all in real-time with our microservices-powered platform.
      </p>

      <div className="flex gap-4 justify-center">
        {user ? (
          <Link
            to="/dashboard"
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Go to Dashboard
          </Link>
        ) : (
          <>
            <Link
              to="/register"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="border-2 border-indigo-600 text-indigo-600 px-8 py-3 rounded-lg text-lg font-medium hover:bg-indigo-50 transition-colors"
            >
              Sign In
            </Link>
          </>
        )}
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <div className="p-6 bg-white rounded-xl shadow-sm border">
          <div className="text-3xl mb-3">⚡</div>
          <h3 className="font-semibold text-lg mb-2">Fast Redirects</h3>
          <p className="text-gray-600 text-sm">Redis-cached redirects in under 50ms with Base62 encoding</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border">
          <div className="text-3xl mb-3">📊</div>
          <h3 className="font-semibold text-lg mb-2">Real-time Analytics</h3>
          <p className="text-gray-600 text-sm">Kafka-powered click streaming with Cassandra time-series storage</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border">
          <div className="text-3xl mb-3">🛡️</div>
          <h3 className="font-semibold text-lg mb-2">Rate Limited</h3>
          <p className="text-gray-600 text-sm">Sliding window rate limiter protecting against abuse</p>
        </div>
      </div>
    </div>
  );
}

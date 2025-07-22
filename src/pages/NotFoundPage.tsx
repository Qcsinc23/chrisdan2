import { Link } from 'react-router-dom'
import { Home, Search } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center text-center py-20">
      <div className="max-w-md mx-auto px-4">
        <div className="text-blue-600">
          <svg 
            className="w-32 h-32 mx-auto" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1} 
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
        <h1 className="mt-8 text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl">
          404 - Page Not Found
        </h1>
        <p className="mt-6 text-lg text-gray-600">
          Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Home className="mr-2 -ml-1 h-5 w-5" />
            Go to Homepage
          </Link>
          <Link
            to="/tracking"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Search className="mr-2 -ml-1 h-5 w-5" />
            Track a Package
          </Link>
        </div>
      </div>
    </div>
  )
}

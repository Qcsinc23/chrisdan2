import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Package, Phone, Mail } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const { user, isStaff, isCustomer, signOut } = useAuth()

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Track Package', href: '/tracking' },
    { name: 'Services', href: '/services' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'FAQ', href: '/faq' }
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      {/* Top contact bar */}
      <div className="bg-blue-900 text-white text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-10">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Phone className="h-3 w-3" />
                <span>718-738-1490</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-3 w-3" />
                <span>chrisdanenterprises@gmail.com</span>
              </div>
            </div>
            <div className="hidden md:block text-xs">
              Mon-Fri 10am-6pm | Sat 10am-2pm | Sun & Holidays Closed
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-xl font-bold text-gray-900">Chrisdan Enterprises</div>
                <div className="text-xs text-gray-500">Shipping to Caribbean & Central America</div>
              </div>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            {/* User section */}
            {user ? (
              <div className="flex items-center space-x-4">
                {isStaff ? (
                  <Link
                    to="/staff/dashboard"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Staff Dashboard
                  </Link>
                ) : isCustomer ? (
                  <Link
                    to="/customer/dashboard"
                    className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    My Account
                  </Link>
                ) : (
                  <Link
                    to="/customer/dashboard"
                    className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={signOut}
                  className="text-gray-700 hover:text-red-600 text-sm font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/customer/login"
                  className="text-gray-700 hover:text-green-600 text-sm font-medium"
                >
                  Customer Login
                </Link>
                <Link
                  to="/staff/login"
                  className="text-gray-700 hover:text-blue-600 text-sm font-medium"
                >
                  Staff Login
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-3 py-2 text-base font-medium transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {user ? (
              <div className="space-y-1 pt-2 border-t">
                {isStaff ? (
                  <Link
                    to="/staff/dashboard"
                    className="block px-3 py-2 text-base font-medium text-blue-600 hover:bg-blue-50"
                    onClick={() => setIsOpen(false)}
                  >
                    Staff Dashboard
                  </Link>
                ) : isCustomer ? (
                  <Link
                    to="/customer/dashboard"
                    className="block px-3 py-2 text-base font-medium text-green-600 hover:bg-green-50"
                    onClick={() => setIsOpen(false)}
                  >
                    My Account
                  </Link>
                ) : (
                  <Link
                    to="/customer/dashboard"
                    className="block px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    signOut()
                    setIsOpen(false)
                  }}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-1 pt-2 border-t">
                <Link
                  to="/customer/login"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  Customer Login
                </Link>
                <Link
                  to="/staff/login"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  Staff Login
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

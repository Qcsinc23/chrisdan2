import { Package, Phone, Mail, MapPin, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Package className="h-6 w-6 text-blue-400" />
              <div className="text-lg font-bold">Chrisdan Enterprises</div>
            </div>
            <p className="text-gray-300 text-sm">
              Your trusted partner for shipping barrels and boxes to the Caribbean and Central America. 
              Professional, reliable, and affordable shipping services since years.
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-400">Contact Us</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-0.5 text-blue-400 flex-shrink-0" />
                <span className="text-gray-300">
                  142-49 Rockaway Blvd<br />
                  Jamaica, NY 11436
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-blue-400" />
                <span className="text-gray-300">718-738-1490</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-blue-400" />
                <span className="text-gray-300">chrisdanenterprises@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-400">Business Hours</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-400" />
                <div>
                  <div>Mon-Fri: 10am-6pm</div>
                  <div>Saturday: 10am-2pm</div>
                  <div>Sunday & Holidays: Closed</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-400">Quick Links</h3>
            <div className="space-y-2 text-sm">
              <Link to="/tracking" className="block text-gray-300 hover:text-blue-400 transition-colors">
                Track Your Package
              </Link>
              <Link to="/services" className="block text-gray-300 hover:text-blue-400 transition-colors">
                Our Services
              </Link>
              <Link to="/about" className="block text-gray-300 hover:text-blue-400 transition-colors">
                About Us
              </Link>
              <Link to="/faq" className="block text-gray-300 hover:text-blue-400 transition-colors">
                FAQ
              </Link>
              <Link to="/contact" className="block text-gray-300 hover:text-blue-400 transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-300 text-sm">
              © 2025 Chrisdan Enterprises LLC. All rights reserved.
            </div>
            <div className="text-gray-300 text-sm mt-2 md:mt-0">
              Professional shipping services to Caribbean & Central America
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
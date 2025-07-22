import { Link } from 'react-router-dom'
import { 
  Package, 
  Search, 
  Globe, 
  Users, 
  Clock, 
  Shield, 
  ArrowRight,
  CheckCircle,
  Star,
  Truck,
  MapPin,
  UserPlus,
  FileText,
  Calendar,
  MessageCircle
} from 'lucide-react'

export default function HomePage() {
  const services = [
    {
      icon: Package,
      title: 'Barrel & Box Shipping',
      description: 'Send barrels and boxes safely to Caribbean and Central America',
      features: ['Multiple sizes available', 'Secure packaging', 'Competitive rates']
    },
    {
      icon: Search,
      title: 'Package Tracking',
      description: 'Track your shipments in real-time with detailed status updates',
      features: ['Real-time updates', 'SMS notifications', 'Delivery confirmation']
    },
    {
      icon: Truck,
      title: 'Pickup & Delivery',
      description: 'Convenient pickup and delivery services in NYC area',
      features: ['Door-to-door service', 'Flexible scheduling', 'Professional handling']
    },
    {
      icon: Users,
      title: 'Frequent Shipper Program',
      description: 'Special rates and benefits for regular customers',
      features: ['Discounted rates', 'Priority handling', 'Mailbox service']
    }
  ]

  const destinations = [
    'Jamaica', 'Guyana', 'Trinidad & Tobago', 'Barbados', 
    'Suriname', 'French Guiana', 'Belize', 'Costa Rica',
    'Panama', 'Nicaragua', 'Honduras', 'Guatemala'
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="absolute inset-0">
          <img 
            src="/images/hero-shipping.jpg" 
            alt="Shipping containers"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h1 className="text-5xl lg:text-6xl font-bold mb-6">
                  Ship to the 
                  <span className="text-blue-300"> Caribbean</span> & 
                  <span className="text-blue-300"> Central America</span>
                </h1>
                <p className="text-xl text-blue-100 leading-relaxed">
                  Professional barrel and box shipping services with real-time tracking. 
                  Your trusted partner for reliable, affordable shipping to your loved ones.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link 
                  to="/tracking"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <Search className="h-5 w-5" />
                  <span>Track Package</span>
                </Link>
                <Link 
                  to="/services"
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Our Services</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>

              <div className="flex items-center space-x-8 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>Licensed & Insured</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-blue-300" />
                  <span>Fast Delivery</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-blue-300" />
                  <span>Secure Handling</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Tracking Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Track Your Package</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Enter your tracking number below to get real-time updates on your shipment
            </p>
          </div>
          
          <div className="max-w-md mx-auto">
            <div className="bg-gray-50 p-6 rounded-lg">
              <form className="space-y-4">
                <div>
                  <label htmlFor="tracking" className="block text-sm font-medium text-gray-700 mb-2">
                    Tracking Number
                  </label>
                  <input 
                    type="text" 
                    id="tracking"
                    placeholder="Enter your tracking number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <Link 
                  to="/tracking"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <Search className="h-5 w-5" />
                  <span>Track Package</span>
                </Link>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Portal Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Customer Portal</h2>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Create your account to access exclusive self-service features, manage your shipments, and save time
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 text-center">
              <UserPlus className="h-12 w-12 mx-auto mb-4 text-green-300" />
              <h3 className="text-lg font-semibold mb-2">Account Management</h3>
              <p className="text-green-100 text-sm">Create and manage your shipping profile</p>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-blue-300" />
              <h3 className="text-lg font-semibold mb-2">Service Booking</h3>
              <p className="text-blue-100 text-sm">Schedule pickup and delivery services online</p>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-green-300" />
              <h3 className="text-lg font-semibold mb-2">Document Upload</h3>
              <p className="text-green-100 text-sm">Upload customs forms and shipping documents</p>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-blue-300" />
              <h3 className="text-lg font-semibold mb-2">Live Support</h3>
              <p className="text-blue-100 text-sm">Get instant help through live chat</p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <Link 
                to="/customer/register"
                className="inline-flex items-center justify-center w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Create Account
              </Link>
              <Link 
                to="/customer/login"
                className="inline-flex items-center justify-center w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-green-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
              >
                Customer Login
              </Link>
            </div>
            <p className="text-green-200 text-sm mt-4">
              Join thousands of satisfied customers who enjoy our convenient self-service features
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive shipping solutions designed to meet all your Caribbean and Central America shipping needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon
              return (
                <div key={index} className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
                  <div className="text-blue-600 mb-4">
                    <Icon className="h-12 w-12" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center space-x-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Destinations Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">We Ship To</h2>
              <p className="text-xl text-gray-600 mb-8">
                Reliable shipping services to major destinations across the Caribbean and Central America
              </p>
              <div className="grid grid-cols-2 gap-4">
                {destinations.map((destination, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="text-gray-700">{destination}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link 
                  to="/services"
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold"
                >
                  <span>View all destinations</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div>
              <img 
                src="/images/caribbean-shipping.png" 
                alt="Caribbean shipping map"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose Chrisdan Enterprises?</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Years of experience, thousands of satisfied customers, and a commitment to excellence
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-800 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Star className="h-10 w-10 text-yellow-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Trusted Experience</h3>
              <p className="text-blue-100">
                Years of reliable shipping services with thousands of successful deliveries to the Caribbean and Central America.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-800 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Clock className="h-10 w-10 text-blue-300" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Fast & Reliable</h3>
              <p className="text-blue-100">
                Quick processing times, regular shipping schedules, and reliable delivery to your destination.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-800 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Shield className="h-10 w-10 text-green-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Secure & Insured</h3>
              <p className="text-blue-100">
                Your packages are handled with care, fully insured, and tracked throughout the entire shipping process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Ship?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Contact us today to get started with your shipment or visit our location in Jamaica, NY
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link 
              to="/contact"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Get Quote
            </Link>
            <Link 
              to="/tracking"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Track Package
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

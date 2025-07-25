import { Link } from 'react-router-dom'
import { 
  Package, 
  Truck, 
  Globe, 
  Clock, 
  Shield, 
  Users, 
  MapPin, 
  CheckCircle,
  ArrowRight,
  Scale,
  CreditCard,
  Box
} from 'lucide-react'

export default function ServicesPage() {
  const services = [
    {
      icon: Package,
      title: 'Barrel Shipping',
      description: 'Send large items safely in sturdy barrels to the Caribbean and Central America',
      features: [
        'Multiple barrel sizes available',
        'Secure packaging and handling',
        'Competitive pricing per barrel',
        'Insurance coverage available'
      ],
      pricing: 'Starting from $75/barrel',
      image: '/images/barrel-shipping.jpg'
    },
    {
      icon: Box,
      title: 'Box Shipping',
      description: 'Perfect for smaller items, documents, and fragile goods',
      features: [
        'Various box sizes',
        'Express and standard options',
        'Fragile item handling',
        'Door-to-door delivery'
      ],
      pricing: 'Starting from $25/box',
      image: '/images/box-shipping.jpg'
    },
    {
      icon: Truck,
      title: 'Pickup & Delivery',
      description: 'Convenient pickup from your location and delivery services',
      features: [
        'Free pickup in NYC area',
        'Scheduled pickup appointments',
        'Professional handling',
        'Real-time tracking'
      ],
      pricing: 'Free within 5 miles',
      image: '/images/team.jpeg'
    },
    {
      icon: Users,
      title: 'Frequent Shipper Program',
      description: 'Special rates and benefits for our regular customers',
      features: [
        'Discounted shipping rates',
        'Priority processing',
        'Dedicated customer service',
        'Mailbox rental service'
      ],
      pricing: 'Save up to 20%',
      image: '/images/barcode-scanning.png'
    }
  ]

  const destinations = [
    { country: 'Jamaica', transit: '7-10 days', popular: true },
    { country: 'Guyana', transit: '10-14 days', popular: true },
    { country: 'Trinidad & Tobago', transit: '8-12 days', popular: true },
    { country: 'Barbados', transit: '9-13 days', popular: false },
    { country: 'Suriname', transit: '12-16 days', popular: false },
    { country: 'French Guiana', transit: '14-18 days', popular: false },
    { country: 'Belize', transit: '11-15 days', popular: true },
    { country: 'Costa Rica', transit: '10-14 days', popular: false },
    { country: 'Panama', transit: '9-13 days', popular: false },
    { country: 'Nicaragua', transit: '12-16 days', popular: false },
    { country: 'Honduras', transit: '13-17 days', popular: false },
    { country: 'Guatemala', transit: '11-15 days', popular: false }
  ]

  const additionalServices = [
    {
      icon: Scale,
      title: 'Shack-A-Barrel',
      description: 'Our signature barrel packing service'
    },
    {
      icon: MapPin,
      title: 'UPS Access Point',
      description: 'Convenient UPS package pickup and drop-off'
    },
    {
      icon: Package,
      title: 'Bounce Luggage Storage',
      description: 'Temporary luggage storage services'
    },
    {
      icon: Globe,
      title: 'Affiliate Shopping',
      description: 'Shopping assistance for Caribbean products'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Our <span className="text-blue-300">Shipping Services</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Comprehensive shipping solutions to the Caribbean and Central America. 
              Professional, reliable, and affordable services you can trust.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link 
                to="/contact"
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
              >
                Get Quote
              </Link>
              <Link 
                to="/tracking"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
              >
                Track Package
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Services */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Main Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from our range of shipping options designed to meet your specific needs
            </p>
          </div>
          
          <div className="space-y-16">
            {services.map((service, index) => {
              const Icon = service.icon
              const isEven = index % 2 === 0
              
              return (
                <div key={index} className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}>
                  <div className="lg:w-1/2">
                    <img 
                      src={service.image} 
                      alt={service.title}
                      className="w-full h-80 object-cover rounded-lg shadow-lg"
                    />
                  </div>
                  <div className="lg:w-1/2 space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <Icon className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-gray-900">{service.title}</h3>
                        <p className="text-lg text-blue-600 font-semibold">{service.pricing}</p>
                      </div>
                    </div>
                    
                    <p className="text-lg text-gray-600 leading-relaxed">
                      {service.description}
                    </p>
                    
                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold text-gray-900">Features:</h4>
                      <ul className="space-y-2">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Link 
                      to="/contact"
                      className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                      <span>Get Quote</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Shipping Destinations</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We ship to major destinations across the Caribbean and Central America
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((destination, index) => (
              <div key={index} className={`p-6 rounded-lg border-2 transition-all hover:shadow-lg ${
                destination.popular 
                  ? 'border-blue-200 bg-blue-50' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <MapPin className={`h-5 w-5 ${
                      destination.popular ? 'text-blue-600' : 'text-gray-500'
                    }`} />
                    <h3 className={`text-lg font-semibold ${
                      destination.popular ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {destination.country}
                    </h3>
                  </div>
                  {destination.popular && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                      Popular
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Transit: {destination.transit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Additional Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Extra services to make your shipping experience even more convenient
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {additionalServices.map((service, index) => {
              const Icon = service.icon
              return (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow">
                  <div className="text-blue-600 mb-4">
                    <Icon className="h-12 w-12" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose Chrisdan Enterprises?</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Experience the difference with our professional shipping services
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-800 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Shield className="h-10 w-10 text-blue-300" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Secure & Insured</h3>
              <p className="text-blue-100">
                All packages are handled with care and fully insured for your peace of mind.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-800 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Clock className="h-10 w-10 text-blue-300" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Fast & Reliable</h3>
              <p className="text-blue-100">
                Quick processing times and reliable delivery schedules you can count on.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-800 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <CreditCard className="h-10 w-10 text-blue-300" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Competitive Rates</h3>
              <p className="text-blue-100">
                Affordable pricing with no hidden fees. Get the best value for your shipping needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Ship?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Contact us today for a quote or visit our location in Jamaica, NY to get started
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link 
              to="/contact"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Get Quote Now
            </Link>
            <Link 
              to="/about"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

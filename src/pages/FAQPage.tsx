import { useState } from 'react'
import { ChevronDown, ChevronUp, Search, Package, Clock, DollarSign, MapPin, Shield, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const faqData: FAQItem[] = [
    {
      id: '1',
      question: 'How do I track my package?',
      answer: 'You can track your package using the tracking number provided when you ship with us. Simply enter your tracking number on our tracking page, and you\'ll see real-time updates on your package\'s location and status.',
      category: 'tracking'
    },
    {
      id: '2',
      question: 'What countries do you ship to?',
      answer: 'We ship to 12 countries across the Caribbean and Central America, including Jamaica, Guyana, Trinidad & Tobago, Barbados, Suriname, French Guiana, Belize, Costa Rica, Panama, Nicaragua, Honduras, and Guatemala.',
      category: 'shipping'
    },
    {
      id: '3',
      question: 'How long does shipping take?',
      answer: 'Shipping times vary by destination. Jamaica typically takes 7-10 days, while other Caribbean islands take 8-14 days. Central American countries usually take 9-17 days. We provide estimated delivery dates when you ship.',
      category: 'shipping'
    },
    {
      id: '4',
      question: 'What are your shipping rates?',
      answer: 'Our rates depend on the destination, package size, and service type. Barrel shipping starts from $75, and box shipping starts from $25. Contact us for a detailed quote based on your specific needs.',
      category: 'pricing'
    },
    {
      id: '5',
      question: 'Do you offer pickup services?',
      answer: 'Yes, we offer free pickup within 5 miles of our Jamaica, NY location. For areas beyond this, we can arrange pickup for a small additional fee. Call us to schedule a pickup appointment.',
      category: 'services'
    },
    {
      id: '6',
      question: 'Are my packages insured?',
      answer: 'Yes, all packages are covered by basic insurance. We also offer additional insurance coverage for valuable items. Our team handles all packages with care and follows strict security protocols.',
      category: 'insurance'
    },
    {
      id: '7',
      question: 'What items can I ship?',
      answer: 'You can ship most personal items including clothing, food items, electronics, and household goods. We cannot ship prohibited items such as weapons, hazardous materials, or illegal substances. Contact us if you\'re unsure about specific items.',
      category: 'shipping'
    },
    {
      id: '8',
      question: 'What payment methods do you accept?',
      answer: 'We accept cash, credit cards (Visa, MasterCard, American Express), debit cards, and money orders. Payment is required when dropping off your package or during pickup.',
      category: 'pricing'
    },
    {
      id: '9',
      question: 'Can I change the delivery address after shipping?',
      answer: 'Address changes are possible but must be requested as soon as possible. Contact us immediately if you need to change the delivery address. Additional fees may apply depending on the location of your package.',
      category: 'tracking'
    },
    {
      id: '10',
      question: 'What is the Frequent Shipper Program?',
      answer: 'Our Frequent Shipper Program offers discounted rates, priority processing, and additional services for regular customers. Members save up to 20% on shipping and get access to our mailbox rental service.',
      category: 'services'
    },
    {
      id: '11',
      question: 'Do you provide packaging materials?',
      answer: 'Yes, we have barrels, boxes, and packing materials available for purchase. We also offer a packing service if you prefer to have our team pack your items professionally.',
      category: 'services'
    },
    {
      id: '12',
      question: 'What if my package is damaged?',
      answer: 'In the rare event of package damage, please contact us immediately with photos and details. We will work with you to resolve the issue and process any insurance claims if applicable.',
      category: 'insurance'
    }
  ]

  const categories = [
    { value: 'all', label: 'All Categories', icon: Search },
    { value: 'shipping', label: 'Shipping', icon: Package },
    { value: 'tracking', label: 'Tracking', icon: MapPin },
    { value: 'pricing', label: 'Pricing', icon: DollarSign },
    { value: 'services', label: 'Services', icon: Clock },
    { value: 'insurance', label: 'Insurance', icon: Shield }
  ]

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const filteredFAQs = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Frequently Asked <span className="text-blue-300">Questions</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Find answers to common questions about our shipping services, tracking, 
              pricing, and more. Can't find what you're looking for? Contact us directly.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search frequently asked questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === category.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{category.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Items */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredFAQs.length > 0 ? (
            <div className="space-y-4">
              {filteredFAQs.map((item) => {
                const isOpen = openItems.includes(item.id)
                return (
                  <div key={item.id} className="bg-white rounded-lg shadow-sm border">
                    <button
                      onClick={() => toggleItem(item.id)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 pr-4">
                        {item.question}
                      </h3>
                      {isOpen ? (
                        <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      )}
                    </button>
                    
                    {isOpen && (
                      <div className="px-6 pb-4">
                        <div className="pt-2 border-t border-gray-100">
                          <p className="text-gray-700 leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Results Found</h3>
              <p className="text-gray-600 mb-6">
                We couldn't find any FAQs matching your search. Try different keywords or browse all categories.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('all')
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Quick Links */}
      <section className="bg-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Quick Links</h2>
            <p className="text-xl text-gray-600">
              Access our most popular services and information
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link 
              to="/tracking"
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-lg transition-shadow group"
            >
              <div className="text-blue-600 mb-4 group-hover:text-blue-700">
                <Package className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Track Your Package</h3>
              <p className="text-gray-600">
                Enter your tracking number to see real-time updates on your shipment.
              </p>
            </Link>
            
            <Link 
              to="/services"
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-lg transition-shadow group"
            >
              <div className="text-green-600 mb-4 group-hover:text-green-700">
                <Clock className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Our Services</h3>
              <p className="text-gray-600">
                Learn about our barrel shipping, box shipping, and other services.
              </p>
            </Link>
            
            <Link 
              to="/contact"
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-lg transition-shadow group"
            >
              <div className="text-purple-600 mb-4 group-hover:text-purple-700">
                <Phone className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Contact Us</h3>
              <p className="text-gray-600">
                Get in touch with our team for quotes, questions, or support.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Still Need Help */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Still Need Help?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Our friendly team is ready to assist you with any questions or concerns you may have.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <a 
              href="tel:718-738-1490"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Phone className="h-5 w-5" />
              <span>Call Us: 718-738-1490</span>
            </a>
            <Link 
              to="/contact"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Send Message
            </Link>
          </div>
          
          <div className="mt-8 text-sm text-gray-500">
            <p>Business Hours: Mon-Fri 10am-6pm | Sat 10am-2pm | Sun & Holidays Closed</p>
          </div>
        </div>
      </section>
    </div>
  )
}
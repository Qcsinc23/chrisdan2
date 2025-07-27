import { Routes, Route } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ScrollToTop from '@/components/ScrollToTop'
import HomePage from '@/pages/HomePage'
import TrackingPage from '@/pages/TrackingPage'
import ServicesPage from '@/pages/ServicesPage'
import AboutPage from '@/pages/AboutPage'
import ContactPage from '@/pages/ContactPage'
import FAQPage from '@/pages/FAQPage'
import StaffLoginPage from '@/pages/StaffLoginPage'
import StaffDashboard from '@/pages/StaffDashboard'
import CustomerLoginPage from '@/pages/CustomerLoginPage'
import CustomerRegisterPage from '@/pages/CustomerRegisterPage'
import CustomerDashboard from '@/pages/CustomerDashboard'
import PrivateRoute from '@/components/PrivateRoute'
import LoadingSpinner from '@/components/LoadingSpinner'
import LiveChat from '@/components/LiveChat'
import { Toaster } from 'react-hot-toast'
import NotFoundPage from '@/pages/NotFoundPage'

function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tracking" element={<TrackingPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />
          
          {/* Staff Routes */}
          <Route path="/staff/login" element={<StaffLoginPage />} />
          <Route 
            path="/staff/dashboard/*" 
            element={
              <PrivateRoute requireStaff>
                <StaffDashboard />
              </PrivateRoute>
            } 
          />
          
          {/* Customer Routes */}
          <Route path="/customer/login" element={<CustomerLoginPage />} />
          <Route path="/customer/register" element={<CustomerRegisterPage />} />
          <Route 
            path="/customer/dashboard/*" 
            element={
              <PrivateRoute requireCustomer>
                <CustomerDashboard />
              </PrivateRoute>
            } 
          />

          {/* 404 Not Found Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <LiveChat />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  )
}

export default App

import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import { SocketProvider } from './context/SocketContext';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LogoutConfirmation from './components/LogoutConfirmation';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ServicemanRegister from './pages/ServicemanRegister';
import ServicemanRegisterSuccess from './pages/ServicemanRegisterSuccess';
import ServicemanDashboard from './pages/ServicemanDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import Services from './components/Services';
import Profile from './pages/Profile';
import ServiceRequest from './pages/ServiceRequest';
import ServiceDetails from './pages/ServiceDetails';
import Checkout from './pages/Checkout';
import PaymentPage from './pages/PaymentPage';
import OrderConfirmation from './pages/OrderConfirmation';
import WorkerDashboard from './pages/WorkerDashboard';
import WorkerWelcome from './pages/WorkerWelcome';
import Orders from './pages/Orders';
import AllOrders from './pages/AllOrders';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import JobDetails from './pages/JobDetails';
import AvailableJobs from './components/AvailableJobs';
import MyJobs from './components/MyJobs';
import Transactions from './pages/Transactions';
import AdminWelcome from './pages/AdminWelcome';

// PrivateRoute component
function PrivateRoute({ children, userType }) {
  const { user, loading } = useAuth();
  
  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" />;
  }

  const userIsServiceman = user.type === 'serviceman';
  const userIsWorker = user.type === 'worker';
  const userIsCustomer = user.type === 'customer';
  const userIsAdmin = user.type === 'admin';

  // Redirect based on user type and requested route type
  if (userType === 'admin' && !userIsAdmin) {
    return <Navigate to="/" />;
  }

  if (userType === 'customer' && !userIsCustomer) {
    if (userIsAdmin) {
      return <Navigate to="/admin-welcome" />;
    }
    return userIsServiceman ? <Navigate to="/serviceman/dashboard" /> : <Navigate to="/worker/dashboard" />;
  }

  if (userType === 'serviceman' && !userIsServiceman) {
    if (userIsAdmin) {
      return <Navigate to="/admin-welcome" />;
    }
    return userIsCustomer ? <Navigate to="/" /> : <Navigate to="/worker/dashboard" />;
  }

  if (userType === 'worker' && !userIsWorker) {
    if (userIsAdmin) {
      return <Navigate to="/admin-welcome" />;
    }
    return userIsCustomer ? <Navigate to="/" /> : <Navigate to="/serviceman/dashboard" />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <CartProvider>
          <NotificationProvider>
            <SocketProvider>
              <div className="app">
                <ScrollToTop />
                <Navbar />
                <LogoutConfirmation />
                <div className="pt-16"> {/* Add padding-top to account for fixed navbar */}
                  <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/serviceman-register" element={<ServicemanRegister />} />
                    <Route path="/serviceman-register-success" element={<ServicemanRegisterSuccess />} />
                    <Route path="/worker/welcome" element={<WorkerWelcome />} />
                    <Route path="/admin-welcome" element={<AdminWelcome />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/services/:serviceType" element={<ServiceDetails />} />
                    <Route path="/service-request" element={<ServiceRequest />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/payment" element={<PaymentPage />} />
                    <Route path="/order-confirmation" element={<OrderConfirmation />} />
                    <Route
                      path="/orders"
                      element={
                        <PrivateRoute userType="customer">
                          <Orders />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/my-orders"
                      element={
                        <PrivateRoute userType="customer">
                          <Orders />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/all-orders"
                      element={
                        <PrivateRoute userType="customer">
                          <AllOrders />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/notifications"
                      element={
                        <PrivateRoute userType="customer">
                          <Notifications />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <PrivateRoute userType="customer">
                          <Settings />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/transactions"
                      element={
                        <PrivateRoute userType="customer">
                          <Transactions />
                        </PrivateRoute>
                      }
                    />

                    {/* Protected customer routes */}
                    <Route
                      path="/"
                      element={
                        <PrivateRoute userType="customer">
                          <Home />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <PrivateRoute userType="customer">
                          <Profile />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/customer/dashboard"
                      element={
                        <PrivateRoute userType="customer">
                          <CustomerDashboard />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/service/request"
                      element={
                        <PrivateRoute userType="customer">
                          <ServiceRequest />
                        </PrivateRoute>
                      }
                    />

                    {/* Protected worker routes */}
                    <Route
                      path="/worker/dashboard"
                      element={
                        <PrivateRoute userType="worker">
                          <WorkerDashboard />
                        </PrivateRoute>
                      }
                    />

                    {/* Protected serviceman routes */}
                    <Route
                      path="/serviceman/dashboard"
                      element={
                        <PrivateRoute userType="serviceman">
                          <ServicemanDashboard />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/serviceman-dashboard"
                      element={<Navigate to="/serviceman/dashboard" replace />}
                    />
                    <Route
                      path="/serviceman/available-jobs"
                      element={
                        <PrivateRoute userType="serviceman">
                          <div className="container mx-auto px-4 py-8">
                            <h1 className="text-3xl font-bold mb-6">Available Jobs</h1>
                            <AvailableJobs />
                          </div>
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/serviceman/my-jobs"
                      element={
                        <PrivateRoute userType="serviceman">
                          <div className="container mx-auto px-4 py-8">
                            <h1 className="text-3xl font-bold mb-6">My Jobs</h1>
                            <MyJobs />
                          </div>
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/serviceman/earnings"
                      element={
                        <PrivateRoute userType="serviceman">
                          <div className="container mx-auto px-4 py-8">
                            <h1 className="text-3xl font-bold mb-6">Earnings</h1>
                            <p>Your earnings information will appear here.</p>
                          </div>
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/job/:requestId"
                      element={
                        <PrivateRoute userType="serviceman">
                          <JobDetails />
                        </PrivateRoute>
                      }
                    />
                  </Routes>
                </div>
              </div>
            </SocketProvider>
          </NotificationProvider>
        </CartProvider>
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;

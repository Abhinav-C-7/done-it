import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { CartProvider } from './context/CartContext';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ServicemanRegister from './pages/ServicemanRegister';
import ServicemanDashboard from './pages/ServicemanDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import Services from './components/Services';
import Profile from './pages/Profile';
import ServiceRequest from './pages/ServiceRequest';
import ServiceDetails from './pages/ServiceDetails';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import WorkerDashboard from './pages/WorkerDashboard';
import WorkerWelcome from './pages/WorkerWelcome';
import Orders from './pages/Orders';

// PrivateRoute component
function PrivateRoute({ children, userType }) {
  const { user } = useAuth();
  const isServiceman = user?.type === 'serviceman';
  const isWorker = user?.type === 'worker';
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Redirect servicemen to their dashboard if they try to access customer routes
  if (userType === 'customer' && isServiceman) {
    return <Navigate to="/serviceman-dashboard" />;
  }

  // Redirect customers to home if they try to access serviceman routes
  if (userType === 'serviceman' && !isServiceman) {
    return <Navigate to="/" />;
  }

  // Redirect servicemen to their dashboard if they try to access worker routes
  if (userType === 'worker' && isServiceman) {
    return <Navigate to="/serviceman-dashboard" />;
  }

  // Redirect workers to their dashboard if they try to access serviceman routes
  if (userType === 'serviceman' && isWorker) {
    return <Navigate to="/worker/dashboard" />;
  }

  // Redirect workers to their dashboard if they try to access customer routes
  if (userType === 'customer' && isWorker) {
    return <Navigate to="/worker/dashboard" />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <CartProvider>
          <div className="app">
            <Navbar />
            <div className="pt-16"> {/* Add padding-top to account for fixed navbar */}
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/serviceman-register" element={<ServicemanRegister />} />
                <Route path="/worker/welcome" element={<WorkerWelcome />} />
                <Route path="/services" element={<Services />} />
                <Route path="/services/:serviceType" element={<ServiceDetails />} />
                <Route path="/service-request" element={<ServiceRequest />} />
                <Route path="/checkout" element={<Checkout />} />
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
                  path="/serviceman-dashboard"
                  element={
                    <PrivateRoute userType="serviceman">
                      <ServicemanDashboard />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </div>
          </div>
        </CartProvider>
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;

import "./App.css";
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import WorkerDashboard from "./pages/WorkerDashboard";
import ServiceRequest from "./pages/ServiceRequest";
import Services from "./components/Services";
import Profile from "./pages/Profile";
import ACServiceDetails from './pages/ACServiceDetails';
import PlumbingServiceDetails from './pages/PlumbingServiceDetails';
import ElectricalServiceDetails from './pages/ElectricalServiceDetails';
import CleaningServiceDetails from './pages/CleaningServiceDetails';
import PaintingServiceDetails from './pages/PaintingServiceDetails';
import ComputerRepairServiceDetails from './pages/ComputerRepairServiceDetails';
import TelephoneRepairServiceDetails from './pages/TelephoneRepairServiceDetails';
import LandscapingServiceDetails from './pages/LandscapingServiceDetails';
import PestControlServiceDetails from './pages/PestControlServiceDetails';
import FanInstallationServiceDetails from './pages/FanInstallationServiceDetails';
import CarpentryServiceDetails from './pages/CarpentryServiceDetails';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';

function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <div className="app">
          <Navbar />
          <div className="pt-16"> {/* Add padding-top to account for fixed navbar */}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/ac" element={<ACServiceDetails />} />
              <Route path="/services/plumbing" element={<PlumbingServiceDetails />} />
              <Route path="/services/electrical" element={<ElectricalServiceDetails />} />
              <Route path="/services/cleaning" element={<CleaningServiceDetails />} />
              <Route path="/services/painting" element={<PaintingServiceDetails />} />
              <Route path="/services/computer" element={<ComputerRepairServiceDetails />} />
              <Route path="/services/telephone" element={<TelephoneRepairServiceDetails />} />
              <Route path="/services/landscaping" element={<LandscapingServiceDetails />} />
              <Route path="/services/pestcontrol" element={<PestControlServiceDetails />} />
              <Route path="/services/fan" element={<FanInstallationServiceDetails />} />
              <Route path="/services/carpentry" element={<CarpentryServiceDetails />} />
              <Route path="/service-request" element={<ServiceRequest />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-confirmation" element={<OrderConfirmation />} />
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
                path="/worker/dashboard"
                element={
                  <PrivateRoute userType="worker">
                    <WorkerDashboard />
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
            </Routes>
          </div>
        </div>
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;

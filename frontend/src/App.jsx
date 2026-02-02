import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import CustomerLayout from './layouts/CustomerLayout';

// Auth
import Login from './pages/Login';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import Users from './pages/admin/Users';
import Properties from './pages/admin/Properties';
import LocationTypes from './pages/admin/LocationTypes';
import Locations from './pages/admin/Locations';
import ConfigurationItemTypes from './pages/admin/ConfigurationItemTypes';
import ConfigurationItems from './pages/admin/ConfigurationItems';

// Customer pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import Incidents from './pages/customer/Incidents';
import NewIncident from './pages/customer/NewIncident';
import IncidentDetail from './pages/customer/IncidentDetail';
import Profile from './pages/customer/Profile';

function ProtectedRoute({ children, requireAdmin }) {
  const { getUser, isTokenExpired, hasRole } = useAuth();
  const user = getUser();

  if (!user || isTokenExpired()) {
    return <Navigate to="/login" replace />;
  }
  if (requireAdmin && !hasRole('ROLE_ADMIN')) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function RequireConfigAdmin({ children }) {
  const { hasRole } = useAuth();
  if (!hasRole('ROLE_CONFIGLOCATIONADMIN') && !hasRole('ROLE_ADMIN')) {
    return <Navigate to="/admin" replace />;
  }
  return children;
}

function RootRedirect() {
  const { getUser, isTokenExpired, hasRole } = useAuth();
  const user = getUser();

  if (!user || isTokenExpired()) {
    return <Navigate to="/login" replace />;
  }
  if (hasRole('ROLE_ADMIN')) {
    return <Navigate to="/admin" replace />;
  }
  return <Navigate to="/" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<Users />} />
        <Route
          path="properties"
          element={
            <RequireConfigAdmin>
              <Properties />
            </RequireConfigAdmin>
          }
        />
        <Route
          path="location-types"
          element={
            <RequireConfigAdmin>
              <LocationTypes />
            </RequireConfigAdmin>
          }
        />
        <Route
          path="locations"
          element={
            <RequireConfigAdmin>
              <Locations />
            </RequireConfigAdmin>
          }
        />
        <Route
          path="configuration-item-types"
          element={
            <RequireConfigAdmin>
              <ConfigurationItemTypes />
            </RequireConfigAdmin>
          }
        />
        <Route
          path="configuration-items"
          element={
            <RequireConfigAdmin>
              <ConfigurationItems />
            </RequireConfigAdmin>
          }
        />
      </Route>

      {/* Customer routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <CustomerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CustomerDashboard />} />
        <Route path="incidents" element={<Incidents />} />
        <Route path="incidents/new" element={<NewIncident />} />
        <Route path="incidents/:uuid" element={<IncidentDetail />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="/redirect" element={<RootRedirect />} />
      <Route path="*" element={<Navigate to="/redirect" replace />} />
    </Routes>
  );
}

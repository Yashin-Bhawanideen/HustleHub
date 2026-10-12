import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AuthPage from './pages/AuthPage.jsx';
import ClientHome from './pages/ClientHome.jsx';
import FreelancerHome from './pages/FreelancerHome.jsx';
import ClientBookings from './pages/ClientBookings.jsx';
import FreelancerBookings from './pages/FreelancerBookings.jsx';

/**
 * Root component of the frontend. It defines every page (route) in the app
 * and decides which one the user can see (React Router, n.d.c).
 */
export default function App() {
   // user is null when nobody is logged in. loading is true while the app is
  // still checking for a stored session
  const { user, loading } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          loading ? (
            <div className="center-screen" aria-busy="true">Loading...</div>
          ) : user ? (
            <Navigate to={'/' + user.role} replace />
          ) : (
            <AuthPage />
          )
        }
      />
          <Route path="/client" element={<ProtectedRoute role="client"><ClientHome /></ProtectedRoute>} />
          <Route path="/client/bookings"element={<ProtectedRoute role="client"><ClientBookings /></ProtectedRoute>}/>
      <Route path="/freelancer" element={<ProtectedRoute role="freelancer"><FreelancerHome /></ProtectedRoute>} />
      <Route path="/freelancer/bookings" element={<ProtectedRoute role="freelancer"><FreelancerBookings /></ProtectedRoute>} /> 
    </Routes>
  );
}
// Reference List
// MDN Web Docs ARIA: aria-busy attribute. Available at: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-busy (Accessed: 12 October 2026).

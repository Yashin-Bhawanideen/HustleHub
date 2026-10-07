import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AuthPage from './pages/AuthPage.jsx';
import ClientHome from './pages/ClientHome.jsx';
import FreelancerHome from './pages/FreelancerHome.jsx';

export default function App() {
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
      <Route path="/freelancer" element={<ProtectedRoute role="freelancer"><FreelancerHome /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

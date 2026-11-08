import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Only lets a logged-in user with the matching role see the page.
export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="center-screen" aria-busy="true">Loading...</div>;
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== role) return <Navigate to={'/' + user.role} replace />;

  return children;
}

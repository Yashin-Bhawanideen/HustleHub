import { useAuth } from '../context/AuthContext.jsx';

export default function ClientHome() {
  const { logout } = useAuth();
  return (
    <main className="center-screen role-client">
      <h1 className="success-message">You have been successfully logged in as a client.</h1>
      <button type="button" className="link-button" onClick={logout}>Log out</button>
    </main>
  );
}

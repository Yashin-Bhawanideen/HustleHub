import { useAuth } from '../context/AuthContext.jsx';

export default function FreelancerHome() {
  const { logout } = useAuth();
  return (
    <main className="center-screen role-freelancer">
      <h1 className="success-message">You have been successfully logged in as a freelancer.</h1>
      <button type="button" className="link-button" onClick={logout}>Log out</button>
    </main>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// The two roles a user can pick. Defining them as data lets the radio buttons
// be generated with a loop instead of repeating the same markup.
const ROLES = [
  { value: 'client', title: "I'm a client", text: 'Browse services and book freelancers.' },
  { value: 'freelancer', title: "I'm a freelancer", text: 'Offer your services and get booked.' }
];

const emptyForm = { name: '', email: '', password: '', confirmPassword: '' };

/**
 * Combined login and registration page. The user chooses a role, then
 * switches between logging in and creating an account.
 */
export default function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('client');
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isRegister = mode === 'register';

  function update(event) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }
// Switches between login and registration and clears old messages.
  function switchMode(next) {
    setMode(next);
    setError('');
    setNotice('');
  }
// Checks the password rules on the client before sending the request.
  // These mirror the backend validation so users get quick feedback, but the
  // server still validates again because client-side checks can be bypassed
  // (OWASP, n.d.). Returns an error message, or an empty string if valid.
  function validateRegistration() {
    if (form.password.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(form.password)) return 'Password must contain an uppercase letter.';
    if (!/[a-z]/.test(form.password)) return 'Password must contain a lowercase letter.';
    if (!/\d/.test(form.password)) return 'Password must contain a number.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    return '';
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setNotice('');

    if (isRegister) {
      const problem = validateRegistration();
      if (problem) {
        setError(problem);
        return;
      }
    }

    setSubmitting(true);
    try {
      if (isRegister) {
        await register({ name: form.name, email: form.email, password: form.password, role });
        setMode('login');
        setForm({ ...emptyForm, email: form.email });
        setNotice('Account created. Log in to continue.');
      } else {
        const user = await login({ email: form.email, password: form.password, role });
        navigate('/' + user.role, { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page" data-role={role}>
      <section className="auth-intro">
        <p className="brand">HustleHub+</p>
        <h1>Hire talent or get hired.</h1>

        <fieldset className="role-picker">
          <legend>Choose how you will use HustleHub+</legend>
          {ROLES.map((option) => (
            <label key={option.value} className={'role-option' + (role === option.value ? ' selected' : '')}>
              <input
                type="radio"
                name="role"
                value={option.value}
                checked={role === option.value}
                onChange={() => {
                  setRole(option.value);
                  setError('');
                }}
              />
              <span className="role-title">{option.title}</span>
              <span className="role-text">{option.text}</span>
            </label>
          ))}
        </fieldset>
      </section>

      <section className="auth-form-wrap">
        <div className="auth-card">
          <div className="mode-switch" role="group" aria-label="Log in or create an account">
            <button type="button" className={!isRegister ? 'active' : ''} aria-pressed={!isRegister} onClick={() => switchMode('login')}>
              Log in
            </button>
            <button type="button" className={isRegister ? 'active' : ''} aria-pressed={isRegister} onClick={() => switchMode('register')}>
              Create account
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate={false}>
            {isRegister && (
              <div className="field">
                <label htmlFor="name">Full name</label>
                <input id="name" name="name" type="text" autoComplete="name" minLength={2} maxLength={60} required value={form.name} onChange={update} />
              </div>
            )}

            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" autoComplete="email" required value={form.email} onChange={update} />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                required
                value={form.password}
                onChange={update}
              />
              {isRegister && <p className="hint">At least 8 characters with an uppercase letter, a lowercase letter and a number.</p>}
            </div>

            {isRegister && (
              <div className="field">
                <label htmlFor="confirmPassword">Confirm password</label>
                <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required value={form.confirmPassword} onChange={update} />
              </div>
            )}

            <div aria-live="polite">
              {notice && <p className="message success">{notice}</p>}
              {error && <p className="message error" role="alert">{error}</p>}
            </div>

            <button type="submit" className="submit" disabled={submitting}>
              {submitting
                ? 'Please wait...'
                : isRegister
                ? 'Create ' + role + ' account'
                : 'Log in as a ' + role}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

// Reference List
// MDN Web Docs (n.d.a) Spread syntax. Available at: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax (Accessed: 12 October 2026).
// MDN Web Docs (n.d.b) Regular expressions. Available at: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions (Accessed: 12 October 2026).
// OWASP Input Validation Cheat Sheet. Available at: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html (Accessed: 12 October 2026).
// React  useState. Available at: https://react.dev/reference/react/useState (Accessed: 12 October 2026).
// React  Reacting to Input with State. Available at: https://react.dev/learn/reacting-to-input-with-state (Accessed: 12 October 2026).
// React  Rendering Lists. Available at: https://react.dev/learn/rendering-lists (Accessed: 12 October 2026).

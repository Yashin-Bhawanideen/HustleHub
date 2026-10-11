import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function ClientHome() {
    const { user, logout } = useAuth();

    const [gigs, setGigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedGig, setSelectedGig] = useState(null);
    const [bookingDate, setBookingDate] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function loadGigs() {
            try {
                const data = await api.getClientGigs();

                if (!cancelled) {
                    setGigs(data.gigs);
                    setError('');
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadGigs();

        return () => {
            cancelled = true;
        };
    }, []);

    async function handleBooking(event) {
        event.preventDefault();

        if (!selectedGig || !bookingDate) {
            setMessage('Please select a booking date.');
            return;
        }

        setSubmitting(true);
        setMessage('');

        try {
            const data = await api.createBooking({
                gigId: selectedGig._id,
                bookingDate
            });

            setMessage(data.message);
            setSelectedGig(null);
            setBookingDate('');
        } catch (err) {
            setMessage(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="freelancer-dashboard">
            <header className="dashboard-header">
                <div>
                    <h1>HustleHub+</h1>
                    <p>Welcome, {user?.name || 'Client'}!</p>
                    <p>Find the right freelancer for your next project.</p>
                </div>

                <div>
                    <Link to="/client/bookings">
                        My Bookings
                    </Link>

                    <button
                        type="button"
                        className="link-button"
                        onClick={logout}
                    >
                        Log out
                    </button>
                </div>
            </header>

            <section className="gig-dashboard">
                <div className="gig-section-header">
                    <div>
                        <h2>Available Gigs</h2>
                        <p>Explore services offered by our freelancers.</p>
                    </div>
                </div>

                {error && (
                    <p className="form-error" role="alert">
                        {error}
                    </p>
                )}

                {message && (
                    <p role="status">
                        {message}
                    </p>
                )}

                {loading ? (
                    <p>Loading available gigs...</p>
                ) : gigs.length === 0 ? (
                    <p>No gigs are available yet.</p>
                ) : (
                    <div className="gig-list">
                        {gigs.map((gig) => (
                            <article className="gig-card" key={gig._id}>
                                <div className="gig-card-content">
                                    <h3>{gig.title}</h3>

                                    <p className="gig-name">
                                        Freelancer: {gig.freelancer?.name || gig.name}
                                    </p>

                                    <p className="gig-description">
                                        {gig.description}
                                    </p>

                                    <p className="gig-amount">
                                        R {Number(gig.amount).toFixed(2)}
                                    </p>
                                </div>

                                <div className="gig-card-actions">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedGig(gig);
                                            setBookingDate('');
                                            setMessage('');
                                        }}
                                    >
                                        Booking
                                    </button>
                                </div>

                                {selectedGig?._id === gig._id && (
                                    <form
                                        className="gig-form"
                                        onSubmit={handleBooking}
                                    >
                                        <label>
                                            Select booking date
                                            <input
                                                type="date"
                                                value={bookingDate}
                                                min={new Date().toLocaleDateString(
                                                    'en-CA'
                                                )}
                                                onChange={(event) =>
                                                    setBookingDate(event.target.value)
                                                }
                                                required
                                            />
                                        </label>

                                        <div className="gig-form-actions">
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                            >
                                                {submitting
                                                    ? 'Submitting...'
                                                    : 'Submit Booking'}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedGig(null);
                                                    setBookingDate('');
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function ClientBookings() {
    const { user, logout } = useAuth();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        async function loadBookings() {
            try {
                const data = await api.getMyBookings();

                if (!cancelled) {
                    setBookings(data.bookings);
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

        loadBookings();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <main className="freelancer-dashboard">
            <header className="dashboard-header">
                <div>
                    <h1>My Bookings</h1>
                    <p>
                        Welcome, {user?.name || 'Client'}.
                        Track your booking requests below.
                    </p>
                </div>

                <div>
                    <Link to="/client">Back to Dashboard</Link>

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
                        <h2>Your Booking Requests</h2>
                        <p>
                            Check the date and response for each booking.
                        </p>
                    </div>
                </div>

                {error && (
                    <p className="form-error" role="alert">
                        {error}
                    </p>
                )}

                {loading ? (
                    <p>Loading your bookings...</p>
                ) : bookings.length === 0 ? (
                    <p>You have not made any bookings yet.</p>
                ) : (
                    <div className="gig-list">
                        {bookings.map((booking) => (
                            <article
                                className="gig-card"
                                key={booking._id}
                            >
                                <div className="gig-card-content">
                                    <h3>
                                        {booking.gig?.title || 'Gig unavailable'}
                                    </h3>

                                    <p className="gig-name">
                                        Freelancer:{' '}
                                        {booking.freelancer?.name || 'Unknown'}
                                    </p>

                                    <p>
                                        Booking date:{' '}
                                        {new Date(
                                            booking.bookingDate
                                        ).toLocaleDateString()}
                                    </p>

                                    {booking.gig && (
                                        <>
                                            <p className="gig-description">
                                                {booking.gig.description}
                                            </p>

                                            <p className="gig-amount">
                                                R {Number(
                                                    booking.gig.amount
                                                ).toFixed(2)}
                                            </p>
                                        </>
                                    )}

                                    <p>
                                        Status:{' '}
                                        <strong className={
                                            'booking-status ' +
                                            booking.status.toLowerCase()
                                        }>
                                            {booking.status}
                                        </strong>
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                <p>
                    <Link to="/client">
                        Browse more gigs
                    </Link>
                </p>
            </section>
        </main>
    );
}
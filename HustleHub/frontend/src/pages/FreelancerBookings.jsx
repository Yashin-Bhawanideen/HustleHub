import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
/**
 * Page where a freelancer sees the booking requests clients have made for
 * their gigs and can accept or reject the pending ones.
 */
export default function FreelancerBookings() {
    const { user, logout } = useAuth();

    // All bookings returned by the API for this freelancer.
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
    async function loadBookings() {
        try {
            const data = await api.getFreelancerBookings();
            setBookings(data.bookings);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    loadBookings();
}, []);
// Sends the new status for one booking to the backend, then updates the list
// on screen without reloading the page.
async function handleStatusChange(id, status) {
    try{ 
        setError('');

        // Replace only the changed booking with the updated one returned by the
        // server. map() builds a new array, which is needed because React state
        // must not be changed directly
        const data = await api.updateBookingStatus(id, status);
        setBookings((prev) =>
            prev.map((b) => (b._id === id ? data.booking : b))
        );

        

    } catch (err) {
        // Show the error message returned by the API.
        setError(err.message);
    }
}

return (
    <main className="Freelancer-Dashboard">
        <header className="Dashboard-Header">
            <div>
                <h1>Incoming Bookings</h1>
                <p>Manage booking requests submitted by clients for your gigs.</p>
            </div>

            <div>
                <Link to="/freelancer">Back to Dashboard</Link>
                <button type="button" className="link-button" onClick={logout}>
                Log out
            </button>
        </div>

        </header>

        <section className="gig-dashboard">
        {error && <p className="form-error" role="alert" >{error}</p>}

        {loading ? (
            <p>Loading bookings...</p>
        ) : bookings.length === 0 ? (
            <p>No booking requests received yet.</p>
        ) : (
            <div className="gig-list">
                {bookings.map((booking) => (
                    <article className="gig-card" key={booking._id}>
                        <div className="gig-card-content">
                            <h3> {booking.gig?.title || 'Gig removed'} </h3>

                            <p className="gig-name">
                                Client: {booking.client?.name || 'Unknown'} ({booking.client?.email})
                            </p>

                            <p>
                                Booking Date: {new Date(booking.bookingDate).toLocaleDateString()}
                            </p>

                            <p className="gig-amount">
                                R {Number(booking.gig?.amount).toFixed(2)}
                            </p>

                            <p>
                                Status: {' '}
                                <strong className={'booking-status ' + booking.status.toLowerCase()}>
                                    {booking.status}
                                </strong>
                            </p>

                        </div>

                        {booking.status === 'Pending' && (
                            <div className="gig-card-actions">
                                <button
                                    type="button"
                                    onClick={() => handleStatusChange(booking._id, 'Accepted')}
                                >
                                    Accept
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleStatusChange(booking._id, 'Declined')}
                                    >
                                        Reject
                                    </button>
                        </div>

                        )}

                    </article>

                ))}

            </div>

        )}

        </section>

    </main>
);
}
// Reference List

// MDN Web Docs Array.prototype.map(). Available at: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map (Accessed: 12 October 2026).
// MDN Web Docs ARIA: alert role. Available at: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/alert_role (Accessed: 12 October 2026).
// MDN Web Docs Optional chaining . Available at: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining (Accessed: 12 October 2026).

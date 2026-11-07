import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    async function loadNotifications() {
        try {
            const data = await api.getNotifications();

            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
            setError('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadNotifications();
    }, []);

    async function handleRead(id) {
        try {
            await api.markNotificationRead(id);
            await loadNotifications();
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleReadAll() {
        try {
            await api.markAllNotificationsRead();
            await loadNotifications();
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <section className="notification-panel">
            <div className="notification-header">
                <div>
                    <h2>Notifications</h2>
                    <span>
                        {unreadCount} unread
                    </span>
                </div>

                {unreadCount > 0 && (
                    <button
                        type="button"
                        onClick={handleReadAll}
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {error && (
                <p className="form-error" role="alert">
                    {error}
                </p>
            )}

            {loading ? (
                <p>Loading notifications...</p>
            ) : notifications.length === 0 ? (
                <p>You have no notifications.</p>
            ) : (
                <div className="notification-list">
                    {notifications.map((notification) => (
                        <article
                            key={notification._id}
                            className={
                                'notification-item ' +
                                (notification.readAt ? 'read' : 'unread')
                            }
                        >
                            <div>
                                <h3>{notification.title}</h3>

                                <p>{notification.message}</p>

                                <small>
                                    {new Date(
                                        notification.createdAt
                                    ).toLocaleString()}
                                </small>
                            </div>

                            {!notification.readAt && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleRead(notification._id)
                                    }
                                >
                                    Mark as read
                                </button>
                            )}
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}
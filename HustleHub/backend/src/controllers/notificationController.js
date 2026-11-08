const jwt = require('jsonwebtoken');
const Notification = require('../models/Notification');
const { logActivity } = require('../utils/activityLogger');

// Login notifications that are being created right now, keyed by user + login.
// Stops two requests that arrive at the same moment (for example React
// StrictMode in development) from creating the same notification twice.
const pendingLoginNotifications = new Map();

// Reads the "issued at" time from the JWT that was sent with this request.
// The token has already been verified by the authenticate middleware.
function getTokenIssuedAt(req) {
    const header = req.headers.authorization || '';
    const token = header.split(' ')[1];
    const decoded = token ? jwt.decode(token) : null;

    return decoded && decoded.iat ? decoded.iat : null;
}

// Creates one "login successful" notification for the login (token) making
// this request. Safe to call many times: it only inserts once per login.
async function ensureLoginNotification(req) {
    const issuedAt = getTokenIssuedAt(req);

    if (!issuedAt) {
        return null;
    }

    const key = req.user._id.toString() + ':' + issuedAt;

    if (pendingLoginNotifications.has(key)) {
        return pendingLoginNotifications.get(key);
    }

    const pending = Notification.findOneAndUpdate(
        {
            recipient: req.user._id,
            type: 'login_success',
            loginTokenIat: issuedAt
        },
        {
            $setOnInsert: {
                title: 'Login successful',
                message: 'You have successfully logged in as a ' + req.user.role + '.'
            }
        },
        { upsert: true }
    )
        .exec()
        .finally(() => {
            pendingLoginNotifications.delete(key);
        });

    pendingLoginNotifications.set(key, pending);

    return pending;
}

async function getMyNotifications(req, res, next) {
    try {
        try {
            await ensureLoginNotification(req);
        } catch (loginNoticeError) {
            // Not critical: the user should still see their other notifications.
            console.error(
                '[notifications] Could not create login notification:',
                loginNoticeError.message
            );
        }

        const notifications = await Notification.find({
            recipient: req.user._id
        }).sort({ createdAt: -1 }).limit(100);

        return res.status(200).json({
            success: true,
            notifications,
            unreadCount: notifications.filter(
                notification => !notification.readAt
            ).length
        });
    } catch (error) {
        next(error);
    }
}

async function markNotificationRead(req, res, next) {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            recipient: req.user._id
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found.'
            });
        }

        if (!notification.readAt) {
            notification.readAt = new Date();
            await notification.save();

            await logActivity({
                actor: req.user._id,
                action: 'NOTIFICATION_READ',
                entityType: 'Notification',
                entityId: notification._id,
                details: 'User marked a notification as read.',
                ipAddress: req.ip
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Notification marked as read.',
            notification
        });
    } catch (error) {
        next(error);
    }
}

async function markAllNotificationsRead(req, res, next) {
    try {
        const result = await Notification.updateMany(
            {
                recipient: req.user._id,
                readAt: null
            },
            {
                $set: { readAt: new Date() }
            }
        );

        await logActivity({
            actor: req.user._id,
            action: 'NOTIFICATIONS_MARKED_READ',
            entityType: 'Notification',
            details: 'User marked all notifications as read.',
            ipAddress: req.ip
        });

        return res.status(200).json({
            success: true,
            message: 'All notifications marked as read.',
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getMyNotifications,
    markNotificationRead,
    markAllNotificationsRead
};
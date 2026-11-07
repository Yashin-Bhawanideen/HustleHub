const Notification = require('../models/Notification');
const { logActivity } = require('../utils/activityLogger');

async function getMyNotifications(req, res, next) {
    try {
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
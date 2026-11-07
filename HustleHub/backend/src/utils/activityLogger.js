const AuditLog = require('../models/AuditLog');

async function logActivity({
    actor = null,
    action,
    entityType,
    entityId = null,
    details,
    ipAddress = 'Unknown'
}) {
    try {
        await AuditLog.create({
            actor,
            action,
            entityType,
            entityId,
            details,
            ipAddress
        });
    } catch (error) {
        console.error('[AuditLog] Failed to save activity:', error.message);
    }
}

module.exports = { logActivity };

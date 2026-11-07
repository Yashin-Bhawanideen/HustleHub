const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
    {
        actor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        action: {
            type: String,
            required: true
        },
        entityType: {
            type: String,
            required: true
        },
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },
        details: {
            type: String,
            required: true
        },
        ipAddress: {
            type: String,
            default: 'Unknown'
        }
    },
    {
        timestamps: true
    }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ actor: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);

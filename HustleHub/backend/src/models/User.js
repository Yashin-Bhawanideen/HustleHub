const mongoose = require('mongoose');

const ROLES = ['client', 'freelancer'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254
    },
    // select:false => the hash is NEVER returned by queries unless explicitly requested
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, required: true }
  },
  { timestamps: true }
);

// Shape returned to the frontend - never includes the password hash.
userSchema.methods.toPublic = function toPublic() {
  return { id: this._id.toString(), name: this.name, email: this.email, role: this.role };
};

module.exports = mongoose.model('User', userSchema);
module.exports.ROLES = ROLES;

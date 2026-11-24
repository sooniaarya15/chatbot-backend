const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    settings: {
      botName: { type: String, default: 'Assistant', maxlength: 30 },
      theme: { type: String, enum: ['light', 'dark'], default: 'light' },
      category: { type: String, enum: ['casual', 'professional', 'creative'], default: 'casual' },
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toSafe = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    settings: this.settings,
  };
};

module.exports = mongoose.model('User', userSchema);
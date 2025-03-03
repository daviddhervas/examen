const mongoose = require('mongoose');

// Definir el modelo de Usuario
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  surname: {
    type: String,
    required: true
  },
  dob: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  profilePic: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Referencia a las actividades del usuario
userSchema.virtual('activities', {
  ref: 'Activity',
  localField: '_id',
  foreignField: 'userId'
});

const User = mongoose.model('User', userSchema);

module.exports = User;

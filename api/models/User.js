const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
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
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },
  profileImage: {
    type: String
  },
  rut: {
    type: String
  },
  phone: {
    type: String
  },
  address: {
    type: String
  },
  // Información académica
  studentId: {
    type: String
  },
  program: {
    type: String,
    default: 'Ingeniería Civil Informatica'
  },
  yearOfAdmission: {
    type: Number,
    default: new Date().getFullYear()
  },
  status: {
    type: String,
    default: 'Activo'
  },
  gpa: {
    type: String,
    default: '0.0'
  },
  advisor: {
    type: String,
    default: 'N/A'
  },
  // Sesiones activas
  activeSessions: [{
    deviceType: String,
    deviceName: String,
    location: String,
    lastActive: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Método para encriptar contraseña antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
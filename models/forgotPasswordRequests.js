const mongoose = require('mongoose');

const forgotPasswordRequestSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    isActive: {
        type: Boolean,
        required: true,
        default: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('ForgotPasswordRequest', forgotPasswordRequestSchema);

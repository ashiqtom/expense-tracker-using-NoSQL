const mongoose = require('mongoose');

const fileDownloadedSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    downloadedAt: {
        type: Date,
        default: Date.now
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('FileDownloaded', fileDownloadedSchema);

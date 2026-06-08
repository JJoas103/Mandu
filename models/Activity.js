const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['meeting_join', 'visit_verify', 'feed_write', 'favorite_add'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    relatedLink: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Activity = mongoose.model('Activity', activitySchema);
module.exports = Activity;

const mongoose = require('mongoose');

const feedCommentSchema = new mongoose.Schema(
    {
        feed_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Feed',
            required: true
        },
        writer_name: {
            type: String,
            default: '익명'
        },
        content: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('FeedComment', feedCommentSchema);
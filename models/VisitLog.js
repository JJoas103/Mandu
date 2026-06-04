const mongoose = require('mongoose');

const visitLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        placeId: {
            type: String,
            required: true
        },
        placeName: {
            type: String,
            default: ''
        },
        pointsEarned: {
            type: Number,
            default: 2
        }
    },
    { timestamps: true }
);

const VisitLog = mongoose.model('VisitLog', visitLogSchema);
module.exports = VisitLog;

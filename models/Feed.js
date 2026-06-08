const mongoose = require('mongoose');

const feedSchema = new mongoose.Schema(
    {
        content: { type: String, required: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        locationTag: { type: String, required: true }, // 장소 태그 필수
        image: { type: String }, // 제보 사진
        reactions: {
            like: { type: Number, default: 0 },
            thanks: { type: Number, default: 0 }
        },
        likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    },
    {
        timestamps: true
    }
);

const Feed = mongoose.model('Feed', feedSchema);
module.exports = Feed;

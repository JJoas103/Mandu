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
        place_id: {
            type: String,
            required: true
        },
        place_name: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true,
            enum: ['혼잡도', '주차', '맛집', '날씨', '기타']
        },
        content: {
            type: String,
            required: true,
            trim: true
        },
        gps_verified: {
            type: Boolean,
            default: false
        },
        image_url: {
            type: String,
            default: ''
        },
        helpful_count: {
            type: Number,
            default: 0
        },
        comment_count: {
            type: Number,
            default: 0
        },
        writer_name: {
            type: String,
            default: '익명'
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Feed', feedSchema);

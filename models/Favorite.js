const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    place_id: {
        type: String, // area_cd
        required: true
    },
    reason: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// 한 사용자가 동일한 장소를 중복으로 찜하지 못하도록 인덱스 설정
favoriteSchema.index({ user: 1, place_id: 1 }, { unique: true });

const Favorite = mongoose.model('Favorite', favoriteSchema);
module.exports = Favorite;

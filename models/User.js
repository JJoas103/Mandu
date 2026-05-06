const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String
        },
        nickname: {
            type: String,
            required: true,
            unique: true
        },
        city: {
            type: String,
            enum: ['서울', '경기', '인천', '기타'],
            default: '서울'
        },
        address: {
            type: String
        },
        profileImage: {
            type: String,
            default: 'default-profile.png'
        },
        avatar_emoji: {
            type: String,
            default: '😊'
        },
        manner_score: {
            type: Number,
            default: 50.00
        },
        provider: {
            type: String,
            enum: ['local', 'google', 'naver'],
            default: 'local'
        }
    }, 
    {
        timestamps: true
    }
);

const User = mongoose.model('User', userSchema);
module.exports = User;

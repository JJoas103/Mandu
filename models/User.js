const mongoose = require('mongoose');

const userScema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String
        },
        name: {
            type: String,
            required: true
        },
        address: {
            type: String
        },
        profileImage: {
            type: String,
            default: 'default-profile.png'
        },
        provider : {
            type : String,
            enum : ['local', 'google', 'naver'],
            default : 'local'
        }
    }, 
    {
        timestamps: true
    }
);

const User = mongoose.model('User', userScema);
module.exports = User;


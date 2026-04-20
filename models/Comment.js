const mongoose = require('mongoose');

const commentScema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    board: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board',
        required: true
    }
}, {timestamps: true});

const Comment =  mongoose.model('Comment', commentScema);
module.exports = Comment;

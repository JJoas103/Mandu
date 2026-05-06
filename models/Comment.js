const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // 게시글 참조 (Meeting 또는 Feed로 확장 가능하도록 refPath 사용도 가능하지만, 
    // 여기서는 범용적으로 Board/Meeting 구조를 따름)
    board: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    onModel: {
        type: String,
        required: true,
        enum: ['Board', 'Meeting', 'Feed'],
        default: 'Meeting'
    }
}, { timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;

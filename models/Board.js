const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema(
    {
        title : {type: String, required: true},
        content : {type: String, required: true},
        author : {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
        //author: User 컬렉션 참조
        category : {
            type : String, 
            enum : ['free', 'study', 'suggestion', 'counsel'],
            default : 'free',
            required: true
        },//enum: 열겨형, 속성에 허용되는 값들을 제한
        file: {type: String, default: null}
    },{
        timestamps: true
    }
);

const Board = mongoose.model('Board', boardSchema);
module.exports = Board;

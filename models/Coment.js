const mongoose = require('mongoose');

const comentSchema = new mongoose.Schema({
    boardId : {
        type : mongoose.Schema.Types.ObjectId, ref: 'Board', required : true
    },
    content : {
        type : String, required : true
    },
    comentName : {
        type : mongoose.Schema.Types.ObjectId, ref: 'User', required: true
    }
},
{
    timestamps : true
});

const Coment = mongoose.model('Coment', comentSchema);
module.exports = Coment;
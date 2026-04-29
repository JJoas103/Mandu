const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        email : {
            type : String,
            require : true,
            unique : true
        },
        password : {
            type : String,
            require : true
        },     
        nickname : {
            type : String,
            require : true,
            unique : true
        },
        city : {
            type : String,
            enum : ['서울', '경기', '인천', '기타'],
            default : '서울'
        },
        avatar_emoji : {
            type : String,
            default : '😊'
        },
        manner_score : {
            type : Number,
            default : 50.00
        },
        manner_rank : {
            type : String,
            default : null
        },
          
    },{
        timestamps : true
    }
);

const User = mongoose.model('User', userSchema);
module.exports = User;

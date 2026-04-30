const mongoose = require('mongoose');

<<<<<<< HEAD
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

=======
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
>>>>>>> 5dfe5ec01bf7e474f6493cdbb5da4f87d14f29cd

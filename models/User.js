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
        // 알림 설정 필드 추가
        congestion_alert: { type: String, default: 'uncrowded' },
        notify_start: { type: String, default: '08:00' },
        notify_end: { type: String, default: '22:00' },
        alert_meeting: { type: Boolean, default: true },
        alert_comment: { type: Boolean, default: true },
        alert_badge: { type: Boolean, default: true },
        alert_marketing: { type: Boolean, default: false }
          
    },{
        timestamps : true
    }
);

const User = mongoose.model('User', userSchema);
module.exports = User;

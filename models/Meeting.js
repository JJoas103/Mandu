const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema(
    {
        title : {
            type : String,
            require : true
        },
        description : {
            type : String,
            default : null
        },
        place_id : {
            type : int,
            require : true
        },
        creator_id : {
            type : String,
            require : true
        },
        meeting_date : {
            type : Date,
            require : true
        },
        meeting_time : {
            Timestamp : true,
            require : true
        },
        max_headcount : {
            type : int,
            require : true,
            default : 4
        },
        current_count : {
            type : int,
            require : true,
            default : 1 //주최자 포함
        },
        status : {
            
        }
    }
)
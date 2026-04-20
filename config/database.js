const mongoose = require('mongoose');

//DB 연결
const connectDB = async() =>{
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('DB 연결 성공');
    } catch (error) {
        console.error('DB 연결 실패', error);
        process.exit(1);
    }
};

module.exports = connectDB;
const mongoose = require('mongoose');

const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('DB 연결 성공');
    } catch (error) {
        console.error('DB 연결 실패', error);
        process.exit(1);
    }
};

module.exports = connectDB;
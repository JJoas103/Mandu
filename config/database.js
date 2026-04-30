const mongoose = require('mongoose');

<<<<<<< HEAD
//DB 연결
const connectDB = async() =>{
    try {
        await mongoose.connect(process.env.MONGODB_URI);
=======
const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
>>>>>>> 5dfe5ec01bf7e474f6493cdbb5da4f87d14f29cd
        console.log('DB 연결 성공');
    } catch (error) {
        console.error('DB 연결 실패', error);
        process.exit(1);
    }
};

module.exports = connectDB;
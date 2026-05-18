const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcrypt');

//회원가입 서비스(DB에 회원 객체 저장)
async function createUser({ email, password, nickname, city, avatar_emoji }) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        email,
        password : hashedPassword,
        nickname,
        city,
        avatar_emoji
    });

    await newUser.save();
}

async function checkEmail(email) {
    console.log(email);
    const user = await User.findOne({ email });
    return !user;//DB에 해당 email이 있으면 true
}

const findUserByEmail = async (email) => {
    return await User.findOne({ email });
}

const findUserById = async (id) => {
    return await User.findById(id);
}

//# 회원 정보 업데이트
async function updateUser(userId, { nickname, city, avatar_emoji, password }) {
    const updateData = { nickname, city, avatar_emoji };
    
    // 비밀번호가 입력된 경우에만 암호화하여 추가
    if (password && password.trim() !== "") {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateData.password = hashedPassword;
    }
    
    return await User.findByIdAndUpdate(userId, updateData, { new: true });
}

//# 회원 탈퇴
async function deleteUser(userId, password) {
    try {
        const user = await User.findById(userId);
        if (!user) {
            return { success: false, message: '사용자를 찾을 수 없습니다.' };
        }

        // 비밀번호 검증
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return { success: false, message: '비밀번호가 일치하지 않습니다.' };
        }

        // 사용자 삭제
        await User.findByIdAndDelete(userId);
        return { success: true };
    } catch (error) {
        console.error('회원 탈퇴 서비스 에러:', error);
        throw error;
    }
}

//# 알림 설정 업데이트
async function updateNotifySettings(userId, settings) {
    return await User.findByIdAndUpdate(userId, settings, { new: true });
}

async function getMapView(){
    const response = await axios.get('//dapi.kakao.com/v2/maps/sdk.js?appkey=29603225cd7faa8f69135ba04026e279');
    var mapContainer = document.getElementById('map'),
        mapOption = {
            center: new kakao.maps.LatLng(37.5665, 126.9780),
            level: 8
        };
    var map = new kakao.maps.Map(mapContainer, mapOption);
    console.log(map);
}
module.exports = { createUser, checkEmail, findUserByEmail, findUserById, getMapView, updateUser, updateNotifySettings, deleteUser };
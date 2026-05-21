const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcrypt');

// 회원가입 서비스
async function createUser({ email, password, nickname, city, address, avatar_emoji, uploadFile }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const profile = uploadFile ? uploadFile.filename : "default-profile.png";

    const newUser = new User({
        email,
        password: hashedPassword,
        nickname,
        city,
        address,
        avatar_emoji: avatar_emoji || '😊',
        profileImage: profile,
        provider: 'local'
    });

    await newUser.save();
    return newUser;
}

// 소셜 회원가입/로그인 처리
async function createSocialUser({ email, nickname, profileImage, address, provider }) {
    let user = await User.findOne({ email });
    if (user) return user;

    const newUser = new User({
        email,
        nickname,
        profileImage,
        address: address || '',
        provider,
        // 소셜 가입 시 기본값 설정
        city: '서울',
        avatar_emoji: '😊'
    });
    await newUser.save();
    return newUser;
}

// 이메일 중복 확인
async function checkEmail(email) {
    const user = await User.findOne({ email });
    return !user; // 없으면 true (사용 가능)
}

// ID로 사용자 찾기
async function findUserById(id) {
    return await User.findById(id);
}

// 이메일로 사용자 찾기
async function findUserByEmail(email) {
    return await User.findOne({ email });
}

// 회원 정보 수정
async function updateUser(userId, { password, nickname, city, address, avatar_emoji, uploadFile }) {
    const user = await User.findById(userId);
    if (!user) throw new Error("사용자를 찾을 수 없습니다");

    if (password) {
        user.password = await bcrypt.hash(password, 10);
    }
    if (nickname) user.nickname = nickname;
    if (city) user.city = city;
    if (address) user.address = address;
    if (avatar_emoji) user.avatar_emoji = avatar_emoji;
    if (uploadFile) user.profileImage = uploadFile.filename;

    await user.save();
    return user;
}

// 회원 탈퇴
async function deleteUser(userId, password) {
    const user = await User.findById(userId);
    if (!user) throw new Error("사용자를 찾을 수 없습니다");

    // 로컬 가입자만 비밀번호 확인
    if (user.provider === 'local') {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            const error = new Error("비밀번호가 일치하지 않습니다");
            error.status = 400;
            throw error;
        }
    }

    await User.findByIdAndDelete(userId);
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
module.exports = { createUser, createSocialUser, checkEmail, findUserByEmail, findUserById, getMapView, updateUser, updateNotifySettings, deleteUser };

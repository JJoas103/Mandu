const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcrypt');

// 회원가입 서비스
async function createUser({ email, password, nickname, city, address, avatar_emoji, uploadFile }) {
    // 닉네임 중복 확인
    const existingNickname = await User.findOne({ nickname });
    if (existingNickname) {
        const error = new Error("중복된 닉네임입니다.");
        error.code = 'NICKNAME_DUPLICATE';
        throw error;
    }

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
async function createSocialUser({ email, nickname, city, address, avatar_emoji, uploadFile, provider }) {
    let user = await User.findOne({ email });
    if (user) return user;

    // 닉네임 중복 확인
    const existingNickname = await User.findOne({ nickname });
    if (existingNickname) {
        const error = new Error("중복된 닉네임이 존재합니다.");
        error.code = 'NICKNAME_DUPLICATE';
        throw error;
    }

    // 프로필 이미지 설정 (수동 업로드 우선, 없으면 기본 이미지)
    const profile = uploadFile ? uploadFile.filename : "default-profile.png";

    const newUser = new User({
        email,
        nickname,
        profileImage: profile, // 소셜 이미지를 무시하고 선택한 파일 또는 기본 이미지 사용
        address: address || '',
        provider,
        city: city || '서울',
        avatar_emoji: avatar_emoji || '😊'
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

    if (password && password.trim() !== "") {
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
    if (!user) {
        return { success: false, message: '사용자를 찾을 수 없습니다.' };
    }

    // 로컬 가입자만 비밀번호 확인
    if (user.provider === 'local') {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return { success: false, message: '비밀번호가 일치하지 않습니다.' };
        }
    }

    await User.findByIdAndDelete(userId);
    return { success: true };
}

//# 알림 설정 업데이트
async function updateNotifySettings(userId, settings) {
    return await User.findByIdAndUpdate(userId, settings, { new: true });
}

// 매너 점수 업데이트
async function updateMannerScore(userId, amount) {
    const user = await User.findById(userId);
    if (!user) return null;
    
    const oldScore = user.manner_score || 50;
    const newScore = Math.min(100, Math.max(0, oldScore + amount));
    const actualChange = newScore - oldScore;

    user.manner_score = newScore;
    await user.save();
    return { user, actualChange };
}

async function getMapView(){
    // ... (기존 코드 유지)
}

module.exports = { 
    createUser, 
    createSocialUser, 
    checkEmail, 
    findUserByEmail, 
    findUserById, 
    getMapView, 
    updateUser, 
    updateNotifySettings, 
    deleteUser,
    updateMannerScore
};

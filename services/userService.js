const User = require('../models/User');
const bcrypt = require('bcrypt');

// 회원가입 서비스
async function createUser({ email, password, nickname, city, address, avatar_emoji, uploadFile }) {
    const existingNickname = await User.findOne({ nickname });
    if (existingNickname) {
        const error = new Error("닉네임이 중복됩니다.");
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

// 소셜 가입 처리 (온보딩 폼 데이터 포함)
async function createSocialUser({ email, nickname, city, address, avatar_emoji, uploadFile, provider }) {
    let user = await User.findOne({ email });
    if (user) return user;

    const existingNickname = await User.findOne({ nickname });
    if (existingNickname) {
        const error = new Error("닉네임이 중복됩니다.");
        error.code = 'NICKNAME_DUPLICATE';
        throw error;
    }

    const profile = uploadFile ? uploadFile.filename : "default-profile.png";

    const newUser = new User({
        email,
        nickname,
        profileImage: profile,
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
    return !user;
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
    if (address !== undefined) user.address = address;
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

    if (user.provider === 'local') {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return { success: false, message: '비밀번호가 일치하지 않습니다.' };
        }
    }

    await User.findByIdAndDelete(userId);
    return { success: true };
}

// 알림 설정 업데이트
async function updateNotifySettings(userId, settings) {
    return await User.findByIdAndUpdate(userId, settings, { new: true });
}

// 매너 점수 업데이트
async function updateMannerScore(userId, amount) {
    const user = await User.findById(userId);
    if (!user) return null;

    user.manner_score = Math.min(100, Math.max(0, (user.manner_score || 50) + amount));
    await user.save();
    return user;
}

async function getMapView() {}

module.exports = {
    createUser,
    createSocialUser,
    checkEmail,
    findUserByEmail,
    findUserById,
    getMapView,
    updateUser,
    updateNotifySettings,
    updateMannerScore,
    deleteUser
};

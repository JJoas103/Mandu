const mongoose = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcrypt");

//회원가입 서비스(DB에 회원 객체 저장)
async function createUser({ email, password, name, address, uploadFile }) {
  //비밀번호 해싱
  const hashedPassword = await bcrypt.hash(password, 10);

  //프로필 이미지 처리
  const profile = uploadFile ? uploadFile.filename : "default-profile.png";
  console.log(profile);
  //회원 객체 생성
  const newUser = new User({
    email,
    password: hashedPassword,
    name,
    address,
    profileImage: profile,
  });

  //DB 저장
  await newUser.save();
}
//email로 특정 회원 가져오기(passport 로그인 시 사용)
const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

//ID(고유값)로 특정 회원 가져오기(passport 인증 시 사용)
const findUserById = async (id) => {
  return await User.findById(id);
};

//회원수정
async function updateUser(userId, { password, name, address, uploadFile }) {
  const user = await User.findById(userId);
  const profile = uploadFile ? uploadFile.filename : "default-profile.png";

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const error = new Error("사용자를 찾을 수 없습니다");
    error.status = 404;
    throw error;
  }
  if (!user) {
    throw new Error("사용자를 찾을 수 없습니다");
  }
  //const hashedPassword = await bcrypt.hash(password, 10);

  user.name = name;
  user.address = address;
  user.profileImage = profile;
  //user.password = hashedPassword;

  await user.save();
}

//회원 탈퇴
async function deleteUser(userId, password) {
  const user = await User.findById(userId);
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const error = new Error("사용자를 찾을 수 없습니다");
    error.status = 404;
    throw error;
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error("비밀번호가 일치하지 않습니다");
    error.status = 400; //Bad Request: 클라이언트의 잘못된 요청
    throw error;
  }
  if (!user) {
    throw new Error("사용자를 찾을 수 없습니다");
  }
  await User.findByIdAndDelete(user.id);
}

async function checkEmail(email) {
  const user = await User.findOne({ email });
  return !user; // 사용자가 없으면 true
}

async function createSocialUser({ email, name, profileImage, address, provider }) {
  const newUser = new User({
    email,
    name,
    profileImage,
    address,
    provider,
  });
  await newUser.save();
  return newUser;
}

module.exports = { createUser, findUserByEmail, findUserById, updateUser, deleteUser, checkEmail, createSocialUser };

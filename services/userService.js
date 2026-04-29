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

module.exports = { createUser, checkEmail, findUserByEmail, findUserById };
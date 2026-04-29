const { query } = require("express");
const Meeting = require("../models/Meeting");

// 모임 생성
const createMeeting = async (meetingData) => {};
// 모임 목록 조회
const getAllMeetings = async () => {
  return await Meeting.find().populate("author");
};

module.exports = { getAllMeetings };

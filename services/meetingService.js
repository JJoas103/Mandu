const Meeting = require("../models/Meeting");

// 모임 생성
const createMeeting = async (meetingData, profileImage) => {
    const newMeeting = new Meeting(meetingData, profileImage);
    await newMeeting.save();
    return newMeeting;
};

// 모든 모임 조회 (페이징 포함)
const getAllMeetings = async (page = 1) => {
    const limit = 10;
    const skip = (page - 1) * limit;
    
    const totalMeetings = await Meeting.countDocuments();
    const totalPages = Math.ceil(totalMeetings / limit);
    
    const meetings = await Meeting.find()
        .populate("author", "nickname profileImage avatar_emoji")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
        
    return { meetings, totalPages };
};

// 특정 모임 조회
const getMeetingById = async (id) => {
    const meeting = await Meeting.findById(id)
        .populate("author", "nickname profileImage avatar_emoji")
        .populate("participants", "nickname profileImage");
    if (!meeting) throw new Error("모임을 찾을 수 없습니다");
    return meeting;
};

// 모임 수정
const updateMeeting = async (id, updateData, userId) => {
    const meeting = await Meeting.findById(id);
    if (!meeting) throw new Error("모임을 찾을 수 없습니다");
    if (meeting.author.toString() !== userId) throw new Error("수정 권한이 없습니다");
    
    return await Meeting.findByIdAndUpdate(id, updateData, { new: true });
};

// 모임 삭제
const deleteMeeting = async (id, userId) => {
    const meeting = await Meeting.findById(id);
    if (!meeting) throw new Error("모임을 찾을 수 없습니다");
    if (meeting.author.toString() !== userId) throw new Error("삭제 권한이 없습니다");
    
    await Meeting.findByIdAndDelete(id);
};

// 메인 페이지용 최신 모임 6개
const getMainMeetings = async () => {
    return await Meeting.find()
        .populate("author", "nickname")
        .sort({ createdAt: -1 })
        .limit(6);
};

// 특정 장소의 모임 조회
const getMeetingsByArea = async (areaName) => {
    return await Meeting.find({ area: areaName })
        .populate("author", "nickname")
        .sort({ createdAt: -1 })
        .limit(5);
};

module.exports = {
    createMeeting,
    getAllMeetings,
    getMeetingById,
    updateMeeting,
    deleteMeeting,
    getMainMeetings,
    getMeetingsByArea
};

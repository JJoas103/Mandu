const Meeting = require("../models/Meeting");

// 모임 생성
const createMeeting = async (meetingData, imageUrl) => {
    // meetingData와 imageUrl을 객체로 합쳐서 전달 수정
    const newMeeting = new Meeting({ 
        ...meetingData, 
        imageUrl: imageUrl
    });
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

// 모임 참여/취소 토글 처리
const toggleMeetingParticipation = async (meetingId, userId) => {
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) throw new Error("모임을 찾을 수 없습니다");
    
    if (meeting.author.toString() === userId) {
        throw new Error("주최자는 참여를 취소할 수 없습니다");
    }

    const index = meeting.participants.indexOf(userId);
    let action = '';

    if (index > -1) {
        // 이미 참여 중이면 취소
        meeting.participants.splice(index, 1);
        meeting.status = 'recruit'; // 정원 미달이 되므로 무조건 모집중으로 변경
        action = 'leave';
    } else {
        // 미참여 중이면 참여
        if (meeting.participants.length >= meeting.maxParticipants) {
            throw new Error("모임 정원이 초과되었습니다");
        }
        meeting.participants.push(userId);
        if (meeting.participants.length >= meeting.maxParticipants) {
            meeting.status = 'full';
        }
        action = 'join';
    }
    
    await meeting.save();
    return { meeting, action };
};

module.exports = {
    createMeeting,
    getAllMeetings,
    getMeetingById,
    updateMeeting,
    deleteMeeting,
    getMainMeetings,
    getMeetingsByArea,
    toggleMeetingParticipation
};

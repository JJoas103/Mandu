const Meeting = require("../models/Meeting");

// 모임 생성
const createMeeting = async (meetingData, imageUrl) => {
    // meetingData와 imageUrl을 객체로 합쳐서 전달 수정
    const newMeeting = new Meeting({ 
        ...meetingData, 
        imageUrl: imageUrl,
        participants: [meetingData.author]
    });
    await newMeeting.save();
    return newMeeting;
};

// 모든 모임 조회 (페이징 및 필터 포함)
const getAllMeetings = async (page = 1, filters = {}) => {
    const limit = 10;
    const skip = (page - 1) * limit;
    const now = new Date();
    
    const { status, keyword, congestion } = filters;
    const query = {};
    
    // 기본적으로 삭제되지 않은 것 등 (필요시 추가)
    
    if (status === 'recruit') {
        // 모집중: 상태가 'recruit'이고 아직 시간이 지나지 않은 모임
        query.status = 'recruit';
        query.meetingDate = { $gte: now };
    } else if (status === 'full') {
        // 마감임박: 시간이 지나지 않았고, 24시간 이내에 시작하는 모임
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        query.meetingDate = { $gte: now, $lte: tomorrow };
        query.status = { $ne: 'completed' }; // 이미 종료된 건 제외
    } else if (status) {
        query.status = status;
    }
    
    // 한산한 지역 필터 (과거 모임 제외)
    if (congestion === 'uncrowded') {
        query.congestionLevel = '여유';
        query.meetingDate = { $gte: now };
    }
    
    // 키워드 검색 (과거 모임은 검색 결과에 포함될 수 있음 - 전체 검색 목적)
    if (keyword) {
        query.$or = [
            { title: { $regex: keyword, $options: 'i' } },
            { content: { $regex: keyword, $options: 'i' } },
            { area: { $regex: keyword, $options: 'i' } },
            { tags: { $in: [new RegExp(keyword, 'i')] } }
        ];
    }
    
    const totalMeetings = await Meeting.countDocuments(query);
    const totalPages = Math.ceil(totalMeetings / limit);
    
    // 고급 정렬: 진행 예정 모임(가까운 날짜순) -> 종료된 모임(최근 종료순)
    const meetings = await Meeting.aggregate([
        { $match: query },
        {
            $addFields: {
                isPast: { $cond: [{ $lt: ["$meetingDate", now] }, 1, 0] },
                // 날짜 차이의 절대값 (현재와 가까운 순서 정렬용)
                dateDiff: { $abs: { $subtract: ["$meetingDate", now] } }
            }
        },
        {
            $sort: {
                isPast: 1,    // 0(진행예정) 먼저, 1(종료) 나중에
                dateDiff: 1   // 현재 시간과 가까운 순서대로
            }
        },
        { $skip: skip },
        { $limit: limit },
        {
            $lookup: {
                from: "users",
                localField: "author",
                foreignField: "_id",
                as: "author"
            }
        },
        { $unwind: "$author" },
        {
            $project: {
                "author.password": 0,
                "author.email": 0
            }
        }
    ]);
        
    // 각 모임에 만료 여부 및 상태 정보 추가
    const processedMeetings = meetings.map(meeting => ({
        ...meeting,
        isExpired: new Date(meeting.meetingDate) < now,
        isClosingSoon: new Date(meeting.meetingDate) >= now && new Date(meeting.meetingDate) <= new Date(now.getTime() + 24 * 60 * 60 * 1000),
        isFull: meeting.status === 'full' || meeting.participants.length >= meeting.maxParticipants
    }));
        
    return { meetings: processedMeetings, totalPages };
};

// 특정 모임 조회
const getMeetingById = async (id) => {
    const meeting = await Meeting.findById(id)
        .populate("author", "nickname profileImage avatar_emoji manner_score")
        .populate("participants", "nickname profileImage avatar_emoji manner_score");
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
    
    // 1. 기간 만료 확인
    if (new Date(meeting.meetingDate) < new Date()) {
        throw new Error("이미 종료된 모임에는 참여할 수 없습니다");
    }

    if (meeting.author.toString() === userId) {
        throw new Error("주최자는 참여를 취소할 수 없습니다");
    }

    const index = meeting.participants.indexOf(userId);
    let action = '';

    if (index > -1) {
        // 이미 참여 중이면 취소
        meeting.participants.splice(index, 1);
        // 만약 정원이 다 찼던 상태였다면 다시 모집중으로 변경
        if (meeting.status === 'full') {
            meeting.status = 'recruit';
        }
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

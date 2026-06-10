const Feed = require("../models/Feed");

// 제보 생성
const createFeed = async (feedData) => {
    const newFeed = new Feed(feedData);
    await newFeed.save();
    return newFeed;
};

// 모든 제보 조회
const getAllFeeds = async (page = 1) => {
    const limit = 10;
    const skip = (page - 1) * limit;
    
    const totalFeeds = await Feed.countDocuments();
    const totalPages = Math.ceil(totalFeeds / limit);
    
    const feeds = await Feed.find()
        .populate("author", "nickname avatar_emoji manner_score")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    return { feeds, totalPages, currentPage: page };
};

// 특정 제보 조회
const getFeedById = async (id) => {
    const feed = await Feed.findById(id)
        .populate("author", "nickname profileImage avatar_emoji manner_score");
    if (!feed) throw new Error("제보를 찾을 수 없습니다");
    return feed;
};

// 제보 수정
const updateFeed = async (id, updateData, userId) => {
    const feed = await Feed.findById(id);
    if (!feed) throw new Error("제보를 찾을 수 없습니다");
    if (feed.author.toString() !== userId) throw new Error("수정 권한이 없습니다");
    
    return await Feed.findByIdAndUpdate(id, updateData, { new: true });
};

// 제보 삭제
const deleteFeed = async (id, userId) => {
    const feed = await Feed.findById(id);
    if (!feed) throw new Error("제보를 찾을 수 없습니다");
    if (feed.author.toString() !== userId) throw new Error("삭제 권한이 없습니다");
    
    await Feed.findByIdAndDelete(id);
};

// 반응 추가 (좋아요 등)
const addReaction = async (id, type) => {
    const update = {};
    update[`reactions.${type}`] = 1;
    return await Feed.findByIdAndUpdate(id, { $inc: update }, { new: true });
};

module.exports = { 
    createFeed, 
    getAllFeeds, 
    getFeedById, 
    updateFeed, 
    deleteFeed,
    addReaction
};

const meetingService = require("../services/meetingService");

const getList = async (req, res, next) => {
  try {
    // 서비스에서 데이터 받아옴
    const meetings = await meetingService.getAllMeetings();
    const page = parseInt(req.query.page) || 1; // 페이지 정보, default는 1페이지
    // 전달
    res.render("meeting/list", { meetings });
  } catch (e) {
    next(e);
  }
};
const getWrite = async (req, res, next) => {
  try {
    res.render("meeting/write", {});
  } catch (e) {
    next(e);
  }
};
module.exports = { getList, getWrite };

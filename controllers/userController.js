const userService = require("../services/userService");
const Meeting = require("../models/Meeting");
const Feed = require("../models/Feed");
const Favorite = require("../models/Favorite");
const Place = require("../models/Place");
const Notification = require("../models/Notification");
const Activity = require("../models/Activity");
const placeService = require("../services/placeService");
const kakaoLocalService = require("../services/kakaoLocalService");

// 회원가입 페이지
const getJoin = (req, res) => {
    res.render("member/join", { errors: {} });
};

// 회원가입 처리
const postJoin = async (req, res, next) => {
    try {
        await userService.createUser({ 
            ...req.body, 
            uploadFile: req.file 
        });
        res.redirect("/member/login");
    } catch (error) {
        if (error.code === 'NICKNAME_DUPLICATE') {
            return res.send(`
                <script>
                    alert('입력하신 닉네임이 이미 서비스에 등록되어 있습니다. 다른 닉네임을 사용해 주세요.');
                    history.back();
                </script>
            `);
        }
        next(error);
    }
};

// 소셜 가입 페이지 (온보딩)
const getSocialJoin = (req, res) => {
    if (!req.session.socialData) return res.redirect("/member/login");
    res.render("member/social_join", { socialData: req.session.socialData });
};

// 소셜 가입 처리
const postSocialJoin = async (req, res, next) => {
    if (!req.session.socialData) return res.redirect("/member/login");
    try {
        const { email, provider } = req.session.socialData;
        const { nickname, city, address, avatar_emoji } = req.body;
        
        const user = await userService.createSocialUser({
            email,
            nickname,
            city,
            address,
            avatar_emoji,
            provider,
            uploadFile: req.file
        });

        // 세션 정보 삭제
        delete req.session.socialData;

        // 즉시 로그인
        req.logIn(user, (err) => {
            if (err) return next(err);
            res.redirect("/");
        });
    } catch (error) {
        if (error.code === 'NICKNAME_DUPLICATE') {
            return res.send(`
                <script>
                    alert('입력하신 닉네임이 이미 서비스에 등록되어 있습니다. 다른 닉네임을 사용해 주세요.');
                    history.back();
                </script>
            `);
        }
        next(error);
    }
};

// 이메일 중복 확인
const checkEmail = async (req, res, next) => {
    try {
        const available = await userService.checkEmail(req.query.email);
        res.json({ available });
    } catch (error) {
        next(error);
    }
};

// 로그인 페이지
const getLogin = (req, res) => {
    const messages = req.session.messages || [];
    const errorMessage = messages[messages.length - 1] || null;
    req.session.messages = [];
    res.render("member/login", { errorMessage });
};

// 로그아웃 처리
const logout = (req, res, next) => {
    req.logout((error) => {
        if(error) {
            return next(error);
        }
        res.redirect('/member/login');
    })
}

// 마이페이지
const getMemberInfo = async (req, res, next) => {
    if (!req.isAuthenticated()) return res.redirect("/member/login");
    try {
        const userId = req.user.id;
        const [myMeetings, myFeeds, activities, scoreActivities] = await Promise.all([
            Meeting.find({ $or: [{ author: userId }, { participants: userId }] })
                   .populate('author', 'nickname avatar_emoji')
                   .sort({ createdAt: -1 }),
            Feed.find({ author: userId }).sort({ createdAt: -1 }),
            Activity.find({ user: userId }).sort({ createdAt: -1 }).limit(6),
            Activity.find({ user: userId, scoreChange: { $exists: true, $ne: 0 } }).sort({ createdAt: -1 }).limit(6)
        ]);

        const meetingCount = myMeetings.length;
        const feedCount = myFeeds.length;
        
        res.render("member/info", {
            user: req.user,
            meetingCount,
            feedCount,
            myMeetings,
            myFeeds,
            activities,
            scoreActivities
        });
    } catch(e) {
        next(e);
    }
}
//# 찜·알림 설정 페이지
const getFavorites = async (req, res, next) => {
    if (!req.isAuthenticated()) return res.redirect("/member/login");
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = 8;
        const skip = (page - 1) * limit;

        const [favorites, notifications, totalNotifications] = await Promise.all([
            Favorite.find({ user: userId }),
            Notification.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Notification.countDocuments({ user: userId })
        ]);

        const totalPages = Math.ceil(totalNotifications / limit);
        
        // 각 찜한 장소의 상세 정보 가져오기
        const placeDetails = await Promise.all(favorites.map(async (fav) => {
            const place = await Place.findOne({ area_cd: fav.place_id });
            if (!place) return null;
            
            const imageUrl = await kakaoLocalService.getPlaceImage(place.name);
            return {
                ...place.toObject(),
                imageUrl,
                reason: fav.reason // 찜 사유 추가
            };
        }));

        res.render('member/favorites', { 
            title: '찜·알림 설정',
            user: req.user,
            places: placeDetails.filter(p => p !== null),
            notifications,
            currentPage: page,
            totalPages
        });
    } catch (error) {
        next(error);
    }
};

// 알림 읽음 처리
const markNotificationsAsRead = async (req, res, next) => {
    try {
        const { ids } = req.body;
        await Notification.updateMany({ _id: { $in: ids }, user: req.user.id }, { isRead: true });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 알림 삭제 처리
const deleteNotifications = async (req, res, next) => {
    try {
        const { ids } = req.body;
        await Notification.deleteMany({ _id: { $in: ids }, user: req.user.id });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 현재 페이지의 읽은 알림 전체 삭제
const deleteReadNotifications = async (req, res, next) => {
    try {
        const { ids } = req.body; // 현재 페이지에 표시된 읽은 알림들의 ID 목록
        await Notification.deleteMany({ _id: { $in: ids }, user: req.user.id, isRead: true });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

//# 알림 설정 저장 처리
const postNotifySettings = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { 
            congestion_alert, 
            notify_start, 
            notify_end, 
            alert_meeting, 
            alert_comment, 
            alert_badge, 
            alert_marketing 
        } = req.body;

        await userService.updateNotifySettings(userId, {
            congestion_alert,
            notify_start,
            notify_end,
            alert_meeting: !!alert_meeting,
            alert_comment: !!alert_comment,
            alert_badge: !!alert_badge,
            alert_marketing: !!alert_marketing
        });

        res.send(`
            <script>
                alert('설정이 저장되었습니다.');
                location.href = '/member/favorites';
            </script>
        `);
    } catch (error) {
        next(error);
    }
};

// 회원 수정 페이지
const getModify = (req, res) => {
    if (!req.isAuthenticated()) return res.redirect("/member/login");
    res.render("member/modify", { user: req.user });
};

// 회원 수정 처리
const postModify = async (req, res, next) => {
    try {
        await userService.updateUser(req.user.id, { 
            ...req.body, 
            uploadFile: req.file 
        });
        res.redirect("/member/info");
    } catch (error) {
        next(error);
    }
};

//# 회원 탈퇴 페이지
const getDelete = (req, res) => {
    res.render('member/delete', { title: '회원 탈퇴', errorMessage: null });
};

//# 회원 탈퇴 처리
const postDelete = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.redirect('/member/login');
        }

        const userId = req.user._id;
        const { password } = req.body;
        
        const result = await userService.deleteUser(userId, password);
        
        if (!result.success) {
            return res.render('member/delete', { 
                title: '회원 탈퇴', 
                errorMessage: result.message 
            });
        }
        
        // 탈퇴 성공 시 로그아웃 처리 및 알림 후 이동
        req.logout((err) => {
            if (err) return next(err);
            res.send(`
                <script>
                    alert('탈퇴가 완료되었습니다. 그동안 이용해주셔서 감사합니다.');
                    location.href = '/';
                </script>
            `);
        });
    } catch (error) {
        console.error('회원 탈퇴 컨트롤러 에러:', error);
        next(error);
    }
};

module.exports = { 
    getJoin, 
    postJoin, 
    getSocialJoin, 
    postSocialJoin, 
    checkEmail, 
    getLogin,
    logout,
    getMemberInfo,
    getModify, 
    getFavorites, 
    postModify, 
    getDelete, 
    postDelete, 
    postNotifySettings,
    markNotificationsAsRead,
    deleteNotifications,
    deleteReadNotifications
};

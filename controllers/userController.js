const userService = require('../services/userService');

//# 회원 가입 페이지
const getJoin = (req, res) => {
    res.render('member/join', {
        errors: {}
    });
};
//# 회원가입 처리
const postJoin = async (req, res, next) => {
    try {
        const { email, password, nickname, city, avatar_emoji } = req.body;
        //회원 생성
        await userService.createUser({ email, password, nickname, city, avatar_emoji });
        console.log('회원가입 요청', { email, password, nickname, city, avatar_emoji })
        res.redirect('/');
        
    } catch (error) {
        return next(error);
    }
}
//# 이메일 중복확인
const checkEmail = async (req, res, next) => {
    const { email } = req.query;
    try {
        const avalilabe = await userService.checkEmail(email);
        console.log(avalilabe);
        res.json({ avalilabe });//db에 해당 email이 있으면 false, 없으면 true
    } catch (error) {
        next(error);
    }
}
//# 로그인 페이지
const getLogin = (req, res) => {
    const messages = req.session.messages || [];
    const errorMessage = messages[messages.length - 1] || null;
    req.session.messages = [];
    res.render('member/login', { errorMessage });
};

//로그아웃 처리
const logout = (req, res, next) => {
    req.logout((error) => {
        if(error) {
            return next(error);
        }
        res.redirect('/member/login');
    })
}

const getMapView = async (req, res, next) => {
    try{
        const Mapview = await userService.getMapView();
        res.render('/', { Mapview });
    } catch(error) {
        next(error);
    }
}

//# 마이페이지 (임시)
const getMemberInfo = (req, res) => {
    res.render('member/info', { title: '마이페이지' });
};

//# 정보 수정 페이지
const getModify = (req, res) => {
    res.render('member/modify', { title: '회원정보 수정' });
};

//# 찜·알림 설정 페이지
const getFavorites = (req, res) => {
    res.render('member/favorites', { 
        title: '찜·알림 설정',
        user: req.user
    });
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

//# 정보 수정 처리
const postModify = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { nickname, city, avatar_emoji, member_pass } = req.body;
        
        await userService.updateUser(userId, { 
            nickname, 
            city, 
            avatar_emoji, 
            password: member_pass 
        });
        
        console.log('회원정보 수정 완료:', nickname);
        res.redirect('/member/info');
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

module.exports = { getJoin, postJoin, checkEmail, getLogin, logout, getMapView, getMemberInfo, getModify, getFavorites, postModify, getDelete, postDelete, postNotifySettings };
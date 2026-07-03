const Favorite = require('../models/Favorite');
const Activity = require('../models/Activity');
const userService = require('../services/userService');

const addFavorite = async (req, res, next) => {
    try {
        const { place_id, reason } = req.body;
        const userId = req.user.id;

        // 이미 찜했는지 확인
        const existing = await Favorite.findOne({ user: userId, place_id });
        if (existing) {
            return res.send(`
                <script>
                    alert('이미 찜한 장소입니다.');
                    history.back();
                </script>
            `);
        }

        const newFavorite = new Favorite({ 
            user: userId, 
            place_id,
            reason: reason || ''
        });
        await newFavorite.save();

        // 매너 점수 상승 (+1) 및 활동 기록
        const { actualChange } = await userService.updateMannerScore(userId, 1);
        
        await Activity.create({
            user: userId,
            type: 'favorite_add',
            message: `장소 찜하기 추가`,
            scoreChange: actualChange,
            relatedLink: `/place/${place_id}`
        });

        res.send(`
            <script>
                alert('"${reason}" 이유로 찜한 장소에 추가되었습니다! 매너 점수가 상승했습니다.');
                location.href = '/place/${place_id}';
            </script>
        `);
    } catch (error) {
        next(error);
    }
};

const deleteFavorite = async (req, res, next) => {
    try {
        const { place_id } = req.body;
        const userId = req.user.id;

        await Favorite.findOneAndDelete({ user: userId, place_id });

        res.send(`
            <script>
                alert('찜한 장소에서 삭제되었습니다.');
                location.href = '/member/favorites';
            </script>
        `);
    } catch (error) {
        next(error);
    }
};

module.exports = { addFavorite, deleteFavorite };

const Favorite = require('../models/Favorite');
const userService = require('../services/userService');

exports.addFavorite = async (req, res, next) => {
    if (!req.isAuthenticated()) return res.redirect('/member/login');
    try {
        const { place_id, reason } = req.body;
        const userId = req.user.id;

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

        await userService.updateMannerScore(userId, 1);

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

exports.deleteFavorite = async (req, res, next) => {
    if (!req.isAuthenticated()) return res.redirect('/member/login');
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

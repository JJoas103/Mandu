const User = require('../models/User');


exports.postAdd = async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/member/login');
    }

    const { place_id, place_name } = req.body;
    const userId = req.user._id;

    const alreadyFavorited = req.user.favorites.some(f => f.placeId === place_id);
    if (!alreadyFavorited) {
        await User.findByIdAndUpdate(userId, {
            $push: { favorites: { placeId: place_id, placeName: place_name } }
        });
    }

    res.redirect('/member/favorites');
};

exports.postRemove = async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/member/login');
    }

    const { place_id } = req.body;
    await User.findByIdAndUpdate(req.user._id, {
        $pull: { favorites: { placeId: place_id } }
    });

    res.redirect('/member/favorites');
};

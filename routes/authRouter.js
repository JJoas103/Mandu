const express = require('express');
const router = express.Router();
const passport = require('../config/passport');

router.get('/google', 
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })
);

router.get('/google/callback', 
    passport.authenticate('google', {
        failureRedirect: '/user/login', //인증실패
        successRedirect: '/'            //인증성공
    })
);

router.get('/naver', passport.authenticate('naver'));

router.get('/naver/callback',
    passport.authenticate('naver', {
        failureRedirect: '/user/login',
        successRedirect: '/'
    })
);
module.exports = router;
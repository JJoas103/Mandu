const { body, validationResult } = require('express-validator');

const joinValidationRules = [
    body('email')
        .isEmail().withMessage('유효한 이메일 주소를 입력해주세요')
        .notEmpty().withMessage('이메일은 필수 입력 항목입니다.'),
    body('password')
        .notEmpty().withMessage('비밀번호는 필수 입력 항목입니다')
        .matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .withMessage('비밀번호는 영문, 숫자, 특수문자 조합 8자 이상이어야 합니다'),
    body('nickname')
        .notEmpty().withMessage('이름을 입력하세요')
        .matches(/^.{2,15}$/)
        .withMessage('2~15자 이내로 입력해주세요'),
    body('password2')
        .custom((value, {req}) => {
            if(value !== req.body.password){
                throw new Error('비밀번호가 일치하지 않습니다');
            }
            return true;
        })
];

const validate = (view) => (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        req.validationErrors = {};
        errors.array().forEach(err => {
            req.validationErrors[err.path] = err.msg;
            console.log(`Validation error - ${err.path}: ${err.msg}`);
        });
        return res.render('member/join', {
            errors: req.validationErrors
        });
    }
    return next();
}

module.exports = { joinValidationRules, validate };
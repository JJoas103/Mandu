const { body, validationResult } = require('express-validator');

// # 회원가입 유효성 검사 규칙
const joinValidationRules = [
    body('email')
        .isEmail().withMessage('유효한 이메일 주소를 입력해주세요')
        .notEmpty().withMessage('이메일은 필수 입력 항목입니다'),
    body('password')
        .notEmpty().withMessage('비밀번호는 필수 입력 항목입니다')
        .matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .withMessage('비밀번호는 영문, 숫자, 특수문자 조합 8자 이상이어야 합니다'),
    body('name')
        .notEmpty().withMessage('이름은 필수입니다')
        .matches(/^[가-힣]{2,5}$/)
        .withMessage('이름은 2~5자 한글로 입력하세요'),
    body('password2')
        .custom((value, {req})=>{
            if(value !== req.body.password){
                throw new Error('비밀번호가 일치하지 않습니다');
            }
            return true;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
        })
];

// 검증 결과 처리
/*
const validate = (req, res, next) =>{
    const errors = validationResult(req);
    //validationResult: 요청(req)에서 유효성 검사 결과를 추출해서 반환

    if(!errors.isEmpty()){//유효성 검사 실패
        res.status(400).json({
            success : false,
            errors: errors.array().map(err => ({
                field : err.path,
                message : err.msg
            }))
        //[{msg : '이메일은 필수 입력 항목입니다', path : 'email'}, 
        // {msg : '비밀번호는 영문, 숫자, 특수문자 조합 8자 이상이어야 합니다', path : 'password'}]
        });
    }else{//유효성 검사 통과
        next();
    }
}
*/
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {//유효성 검사 실패
        req.validationErrors = {};
        errors.array().forEach(err => {
            req.validationErrors[err.path] = err.msg;
        });
        //console.log(req.validationErrors);
        return res.render('user/join', {
            errors: req.validationErrors
        });
    }
    next();//라우터가 유효성 검사 처리
}

module.exports = { joinValidationRules, validate };
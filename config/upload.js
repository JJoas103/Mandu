const multer = require('multer');
const path = require('path');

// 파일명 처리
const makeFileName = (req, file, cb) =>{
    const ext = path.extname(file.originalname);//확장자 추출(ex: .png, .jpg, .pdf)
    cb(null, Date.now() + ext);//에러 없음(null), 업로드한 시간.확장자로 파일명 생성
}
// 프로필 이미지 저장 경로 설정
//destination: 파일 저장 경로
//filename: 저장될 파일 명
const profileStorage = multer.diskStorage(
    {
        destination: (req, file, cb) => {
            cb(null, 'public/images/profile');
        },
        filename: makeFileName
    }
);
//게시글 이미지 저장 처리
const boardStorage = multer.diskStorage(
    {
        destination: (req, file, cb) => {
            cb(null, 'public/images/upload')
        },
        filename: makeFileName
    }
);
//이미지 필터
const imageFilter = (req, file, cb) =>{
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp']
    //pdf: aplication/pdf
    if(allowedMimeTypes.includes(file.mimetype)){//허용된 파일 형식
        cb(null, true);
    }else{
        cb(new Error('이미지 파일만 업로드 가능합니다'));
    }
}
// 프로필 사진 미들웨어
const uploadProfile = multer({
    storage: profileStorage,
    //저장 경로(public > images > profile > 업로드한 시간(밀리초).확장자)
    limits: {fileSize: 5 * 1024 * 1024},
    //파일의 용량(5mb로 제한)
    fileFilter: imageFilter
    //형식 제한(이미지만 처리)
});

//게시글 이미지 미들웨어
const uploadBoard = multer({
    storage: boardStorage,
    limits: {fieldSize : 20 * 1024 * 1024},
    fileFilter: imageFilter
});

module.exports = {uploadProfile, uploadBoard}
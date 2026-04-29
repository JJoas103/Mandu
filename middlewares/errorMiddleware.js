const notFoundHandler = (req, res, next) =>{
    const error = new Error('페이지를 찾을 수 없습니다');
    error.status = 404;
    return next(error);
}

const errorHandler = (err, req, res, next) => {

    console.error(`[${req.method} ${req.originalUrl}]`);
    console.error(err.stack);

    const statusCode = err.status || 500;
    const message = err.message || '서버 오류가 발생했습니다';

    if(statusCode === 404){
        return res.status(404).render('error/404', {statusCode, message});
    }//404 에러 발생 시 404페이지 랜더링
    if(statusCode === 400){
        return res.status(400).render('error/400', {statusCode, message});
    }//404 에러 발생 시 400페이지 랜더링
    return res.status(500).render('error/500', { statusCode, message });
}
module.exports = {notFoundHandler, errorHandler};
const Board = require('../models/Board');
const Coment = require('../models/Coment');

//게시글 DB에 저장
async function createBoard({title, content, author, category, file}){

    const fileName = file ? file.filename : null; 

    const newBoard = new Board({
        title,
        content,
        author,
        category,
        file: fileName
    });
    await newBoard.save();
};


//DB에서 카테고리 매개변수와 일치하는 모든 게시글 가져오기
async function getBoardByCategory(category, page){
    const limit = 10;
    const skip = (page - 1) * limit;
    const totalBoards = await Board.countDocuments({category : category});
    //게시글 개수
    const totalPages = Math.ceil(totalBoards/limit);
    //전체 페이지 수 (올림처리)
    const boards = await Board.find({category: category})
                        .populate('author', 'name')
                        .sort({createdAt : -1})//최신순 정렬
                        .skip(skip)
                        .limit(limit);

    return {boards, totalPages, currentPage: page};
}

//DB에서 특정 게시글 ID와 일치하는 특정 게시글 가져오기
async function getBoardById(boardId){
    const board = await Board.findById(boardId)
                        .populate('author', 'name');
    return board;
}

//게시글 수정
async function updateBoard(boardId, {title, content}){

    await Board.findByIdAndUpdate(boardId, {title, content});

}

//게시글 삭제
async function deleteBoard(boardId){
    await Board.findByIdAndDelete(boardId);
}

// =====================================================
//Coment

//댓글 저장
async function createComent({boardId, comentName, content}){
    const newComent = new Coment({
        boardId,
        comentName,
        content
    });
    await newComent.save();
}

//댓글 가져오기
async function getComentById(boardId){
    const coment = await Coment.find({boardId : boardId})
                                    .populate('comentName', 'name')
                                    .sort({createdAt : -1});
    return coment;
}

//특정 댓글 삭제
async function deleteComent(comentId){
    await Coment.findByIdAndDelete(comentId);
}

//카테고리와 상관없이 최신글 6개 가져오기
async function getMainBoards(){
    const mainBoard = await Board.find({})
                .populate('author', 'name')
                .sort({createdAt : -1})
                .limit(6);
    return mainBoard;
}



module.exports = {
    createBoard, getBoardByCategory, updateBoard, getBoardById, 
    deleteBoard, createComent, getComentById, deleteComent, getMainBoards
}; 
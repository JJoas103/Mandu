const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Board = require('./models/Board');
const Meeting = require('./models/Meeting');
const Feed = require('./models/Feed');
const Comment = require('./models/Comment');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/moyeobom';

const seedData = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('데이터베이스 연결 성공');

        // 기존 데이터 삭제 (필요한 경우 주석 해제)
        // await User.deleteMany({});
        // await Board.deleteMany({});
        // await Meeting.deleteMany({});
        // await Feed.deleteMany({});
        // await Comment.deleteMany({});

        // 1. 사용자 생성
        const hashedPassword = await bcrypt.hash('1234', 10);
        
        // 기존 사용자가 있는지 확인 (tomato321@abc.com)
        let existingUser = await User.findOne({ email: 'tomato321@abc.com' });
        if (!existingUser) {
            existingUser = await User.create({
                email: 'tomato321@abc.com',
                password: hashedPassword,
                name: '햄스터',
                address: '서울시 마포구',
                profileImage: 'default-profile.png',
                provider: 'local'
            });
        }

        const users = [
            { email: 'user1@test.com', password: hashedPassword, name: '홍길동', address: '서울시 강남구' },
            { email: 'user2@test.com', password: hashedPassword, name: '김철수', address: '서울시 송파구' },
            { email: 'user3@test.com', password: hashedPassword, name: '이영희', address: '서울시 종로구' },
            { email: 'user4@test.com', password: hashedPassword, name: '박지민', address: '서울시 성동구' }
        ];

        const createdUsers = await User.insertMany(users.map(u => ({ ...u, provider: 'local' })));
        const allUsers = [existingUser, ...createdUsers];
        console.log(`${createdUsers.length}명의 사용자 추가 완료`);

        // 2. 게시판 데이터 생성
        const boards = [
            {
                title: '오늘 날씨 좋네요!',
                content: '연남동 산책하기 딱 좋은 날씨입니다.',
                author: allUsers[0]._id,
                category: 'free'
            },
            {
                title: '자바스크립트 스터디원 모집',
                content: '매주 토요일 강남역에서 스터디하실 분 구합니다.',
                author: allUsers[1]._id,
                category: 'study'
            },
            {
                title: '사이트 건의사항입니다.',
                content: '다크모드 기능이 추가되었으면 좋겠습니다.',
                author: allUsers[2]._id,
                category: 'suggestion'
            },
            {
                title: '취업 고민이 많네요...',
                content: '요즘 채용 시장이 너무 얼어붙은 것 같아요.',
                author: allUsers[3]._id,
                category: 'counsel'
            }
        ];

        const createdBoards = await Board.insertMany(boards);
        console.log(`${createdBoards.length}개의 게시글 추가 완료`);

        // 3. 모임 데이터 생성
        const meetings = [
            {
                title: '연남동 조용한 카페 투어',
                content: '책 읽기 좋은 조용한 카페 같이 가실 분!',
                author: allUsers[0]._id,
                area: '연남동',
                meetingDate: new Date('2026-05-10T14:00:00'),
                maxParticipants: 4,
                participants: [allUsers[0]._id, allUsers[1]._id],
                status: 'recruit',
                tags: ['조용한카페', '독서'],
                congestionLevel: '여유'
            },
            {
                title: '성수동 맛집 탐방',
                content: '줄 서서 먹는 맛집 같이 가요.',
                author: allUsers[2]._id,
                area: '성수동',
                meetingDate: new Date('2026-05-15T18:30:00'),
                maxParticipants: 6,
                participants: [allUsers[2]._id, allUsers[3]._id, allUsers[0]._id],
                status: 'recruit',
                tags: ['맛집', '성수'],
                congestionLevel: '혼잡'
            }
        ];

        await Meeting.insertMany(meetings);
        console.log('모임 데이터 추가 완료');

        // 4. 피드 데이터 생성
        const feeds = [
            {
                content: '지금 연남동 XX카페 사람 별로 없어서 작업하기 좋네요!',
                author: allUsers[1]._id,
                locationTag: '연남동',
                reactions: { like: 5, thanks: 2 }
            },
            {
                content: '망원동 시장 사람 엄청 많아요! 가실 분들 참고하세요.',
                author: allUsers[3]._id,
                locationTag: '망원동',
                reactions: { like: 10, thanks: 8 }
            }
        ];

        await Feed.insertMany(feeds);
        console.log('피드 데이터 추가 완료');

        // 5. 댓글 데이터 생성
        const comments = [
            {
                content: '저도 참여하고 싶어요!',
                author: allUsers[2]._id,
                board: createdBoards[0]._id
            },
            {
                content: '좋은 정보 감사합니다.',
                author: allUsers[0]._id,
                board: createdBoards[1]._id
            }
        ];

        await Comment.insertMany(comments);
        console.log('댓글 데이터 추가 완료');

        console.log('모든 더미 데이터 삽입 완료!');
        process.exit(0);
    } catch (error) {
        console.error('데이터 삽입 중 오류 발생:', error);
        process.exit(1);
    }
};

seedData();

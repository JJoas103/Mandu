require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const axios = require('axios');
const { MongoClient } = require('mongodb');
const fs = require('fs');
const client = new MongoClient(process.env.MONGODB_URL);
async function checkData() {
    
    try {
        await client.connect();
        const db = client.db('MoyeoBom');
        const collection = db.collection('places');
        
        console.log('📊 데이터 분석 중...\n');
        
        // 1. 전체 문서 수
        const total = await collection.countDocuments();
        console.log(`1️⃣  전체 문서 수: ${total}개\n`);
        
        // 2. area_cd null/빈값
        const nullCount = await collection.countDocuments({ area_cd: null });
        const emptyCount = await collection.countDocuments({ area_cd: "" });
        console.log(`2️⃣  null area_cd: ${nullCount}개`);
        console.log(`    빈값 area_cd: ${emptyCount}개\n`);
        
        // 3. 중복 area_cd 확인
        const duplicates = await collection.aggregate([
            { $group: { _id: "$area_cd", count: { $sum: 1 } } },
            { $match: { count: { $gt: 1 } } }
        ]).toArray();
        
        console.log(`3️⃣  중복된 area_cd: ${duplicates.length}개`);
        if (duplicates.length > 0) {
            console.log('   중복 항목:');
            duplicates.forEach(d => {
                console.log(`     - area_cd: "${d._id}", 개수: ${d.count}개`);
            });
        }
        console.log();
        
        // 4. 샘플 데이터 3개
        const samples = await collection.find().limit(3).toArray();
        console.log(`4️⃣  샘플 데이터 (처음 3개):`);
        samples.forEach(s => {
            console.log(`     - area_cd: "${s.area_cd}", name: "${s.name}"`);
        });
        
    } finally {
        await client.close();
    }
}
//place 콜렉션 전체 삭제
async function deleteCollection() {
    try {
        await client.connect();
        const db = client.db('MoyeoBom');
        
        console.log('🗑️  컬렉션 삭제 중...\n');
        
        // places 컬렉션 삭제
        const result = await db.collection('places').deleteMany({});
        console.log(`✅ ${result.deletedCount}개 문서 삭제됨`);
        
        // 컬렉션 자체 삭제
        await db.dropCollection('places');
        console.log(`✅ places 컬렉션 삭제됨\n`);
        
        const collections = await db.listCollections().toArray();
        console.log(`📊 남은 컬렉션: ${collections.map(c => c.name).join(', ')}`);
        
    } catch (error) {
        console.error('❌ 오류:', error.message);
    } finally {
        await client.close();
    }
}

async function importFromJSON() {
    try {
        await client.connect();
        const db = client.db('MoyeoBom');
        const collection = db.collection('places');
        
        const data = JSON.parse(fs.readFileSync('./places_coordinates.json', 'utf-8'));
        const validPlaces = data.places.filter(p => p.id && p.id !== null);
        
        const docs = validPlaces.map(p => ({
            area_cd: p.id,
            categoey: p.category,
            name: p.name,
            latitude: p.lat,
            longitude: p.lng,
            congest_lvl: '여유'
        }));
        
        const result = await collection.insertMany(docs);
        console.log(`✅ ${result.insertedCount}개 문서 추가됨`);
        console.log(`📊 총 문서 수: ${await collection.countDocuments()}개`);
        
        // ← 인덱스 생성 코드 제거
        
    } finally {
        await client.close();
    }
}
async function updateCoordinatesFromAddress() {   
    try {
        await client.connect();
        const db = client.db('MoyeoBom');
        const collection = db.collection('places');
        
        // 모든 장소 가져오기
        const places = await collection.find().toArray();
        console.log(`📍 ${places.length}개 장소 좌표 검증 시작\n`);
        
        let updated = 0;
        let failed = 0;
        
        for (const place of places) {
            try {
                // 카카오 API로 주소 검색
                const response = await axios.get(
                    'https://dapi.kakao.com/v2/local/search/address.json',
                    {
                        params: { query: place.name },
                        headers: { 'Authorization': `KakaoAK ${process.env.KAKAO_REST_API}` }
                    }
                );
                
                if (response.data.documents.length > 0) {
                    const result = response.data.documents[0];
                    const newLat = parseFloat(result.y);
                    const newLng = parseFloat(result.x);
                    
                    // 좌표 업데이트
                    await collection.updateOne(
                        { area_cd: place.area_cd },
                        { $set: { latitude: newLat, longitude: newLng } }
                    );
                    
                    updated++;
                    console.log(`✅ ${place.name}`);
                    console.log(`   이전: ${place.latitude}, ${place.longitude}`);
                    console.log(`   현재: ${newLat}, ${newLng}\n`);
                } else {
                    console.log(`⚠️  ${place.name} - 검색 결과 없음\n`);
                    failed++;
                }
                
            } catch (error) {
                console.log(`❌ ${place.name} - ${error.message}\n`);
                failed++;
            }
            
            // API 제한 회피 (0.1초 대기)
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log(`\n✅ 완료!`);
        console.log(`📝 업데이트된 좌표: ${updated}개`);
        console.log(`⚠️  실패/생략: ${failed}개`);
        
    } finally {
        await client.close();
    }
}

updateCoordinatesFromAddress();

//importFromJSON();
//deleteCollection();
//checkData();
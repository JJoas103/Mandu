require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { MongoClient } = require('mongodb');
const fs = require('fs');

async function updatePlaces() {
    const client = new MongoClient(process.env.MONGODB_URL);
    
    try {
        await client.connect();
        const db = client.db('MoyeoBom');  // 데이터베이스명 수정 필요
        const collection = db.collection('places');  // 기존 컬렉션명
        
        // Update_places.js 상단에 추가
        const result = await collection.deleteMany({ area_cd: null });
        console.log(`🗑️  null 문서 ${result.deletedCount}개 삭제\n`);
    
        // JSON 파일 읽기
        const data = JSON.parse(fs.readFileSync('./places_coordinates.json', 'utf-8'));
        console.log(`📂 JSON 파일 읽음: ${data.places.length}개`);
        
        let updateCount = 0;
        let insertCount = 0;
        // 각 장소마다 업데이트 또는 insert
        for (const place of data.places) {
            const result = await collection.updateOne(
                { area_id: place.id },  // 조건: area_id가 JSON의 id와 같은 항목
                {
                    $set: {
                        category: place.category,
                        name: place.name,
                        latitude: place.lat,
                        longitude: place.lng
                    }
                },
                { upsert: true }  // 없으면 새로 insert
            );
            
            if (result.modifiedCount > 0) {
                updateCount++;
            } else if (result.upsertedCount > 0) {
                insertCount++;
            }
        }
        
        console.log(`\n✅ 완료!`);
        console.log(`📝 업데이트된 문서: ${updateCount}개`);
        console.log(`➕ 새로 추가된 문서: ${insertCount}개`);
        console.log(`📊 총 문서 수: ${await collection.countDocuments()}`);
        
    } catch (error) {
        console.error('❌ 오류:', error);
    } finally {
        await client.close();
    }
}

updatePlaces();
const mongoose = require('mongoose');

const congestion = new mongoose.Schema(
    {
        area_ppltn_min: {
            
        }
    }
)
//과거 혼잡정보(AREA_PPLTN_MIN) << 최소혼잡인구수
//과거 혼잡기준시간(PPLTN_TIME)
//현재 혼잡정보(FCST_PPLTN_MIN)
//현재 혼잡기준시간(FCST_TIME)
//장소 코드명(area_cd)
//
employee
    - 직원번호employee_id(직원정보)
    - 이름name
    - 직급/직책position
    - 연락처phone
    - 입사일hire_date
    - 비밀번호password
    - 성별
movie
    - 영화번호movie_id
    - 제목title
    - 장르genre
    - 관람등급rating
    - 상영시간(분)running_time
    - 개봉일release_date
    - 감독director
    - 줄거리description
    - 상영상태status
    - 등록시각created_at
location
    - 장소번호
    - 장소명
    - 장소유형
    - 운영여부
    - 세부설명
screening
    - 상영회차번호screening_id
    - 영화번호movie_id(fk_movie)
    - 상영관번호hall_id(fk_movie_hall)
    - 상영시작시각start_datetime
    - 상영종료시각end_datetime
    - 현재입장인원수seat_taken
    - 회차상태status
    - 등록관리자명created_by
    
screening_assignment
    - 배치번호assignment_id
    - 상영회차번호screening_id(fk_screening)
    - 직원번호employee_id(fk_employee)
    - 직원배치관리자명assigned_by(fk_employee)
schedule_request
    - 스케줄신청번호request_id
    - 직원번호employee_id(fk_employee)
    - 희망근무날짜work_date
    - work_start_time
    - work_end_time
    - status
    - reviewd_by
schedule
    - 스케줄번호schedule_id
    - 직원번호employee_id(fk_employee)
    - 신청번호request_id(fk_schedule_request)
    - 근무날짜work_date
    - 출근시각scheduled_start
    - 퇴근시각scheduled_end
    - 근무장소location_id(fk_location)
    - 확정한관리자confirmed_by(fk_employee)
attendance
    - 근태번호attendance_id
    - 스케줄번호schedule_id(fk_schedule)
    - 실제출근시간checkin_at
    - 실제퇴근시간checkout_at
    - 휴식시간break_minutes
    - 최종근태판정final_status
    - 실근무시간work_minutes
reward
    - 직원번호employee_id(fk_employee)
    - 잔여마일리지reward_balance
    - 누적적립합계total_earned
    - 누적사용합계total_used
    - 변경이력updated_at
reward_history
    - history_id
    - employee_id
    - type
    - amount
    - balance_after
    - reason
    - processed_by
    - processed_at
payroll
document
post
reservation
contact
lost_item
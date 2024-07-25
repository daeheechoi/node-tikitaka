var options = {  
    host: '192.168.6.45',       // MySQL 서버의 호스트
    user: 'admin',              // MySQL 사용자 이름
    password: '123',           // MySQL 사용자 비밀번호
    database: 'tikitaka',       // 사용할 데이터베이스 이름
    port: 3306,
    
    clearExpired: true,                // 만료된 세션 자동 확인 및 지우기 여부
    checkExpirationInterval: 10000,    // 만료된 세션이 지워지는 빈도 (milliseconds)
    expiration: 1000 * 60 * 60 * 2,    // 유효한 세션의 최대 기간을 2시간으로 설정 (milliseconds)
};

module.exports = options;
//2024 07 12
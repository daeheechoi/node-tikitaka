import React from 'react';
import './CustomerService.css'; // 스타일을 위한 CSS 파일을 추가로 만듭니다.
import logo from '../img/tikitakalogo.png'; 


const Notices = () => {
  return (
    <div className="customer-service">
      <div className="logo-container">
        <img src={logo} alt="티키타카 로고" className="logo" />
      </div>
      <div className="notice-box">
        <div className="notice-header">NOTICE</div>
        <div className="notice-content">
          <h1>한시적 업무시간 조정 안내</h1>
          <p>10:00~11:00</p>
          <hr />
          <p>
            당사는 최근 한시적 으로 확산되는 졸음에 대응하고자
            고객님들에게 크게 불편하지 않은시간을 취침시간으로 조정하였습니다 
          </p>
          <p>
            사이트 이용 및 수정은 차질 없이 진행됨을 알려드리며,
            고객센터 이용에 불편함 없으시도록 일정을 참고해 주시기 바랍니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Notices;
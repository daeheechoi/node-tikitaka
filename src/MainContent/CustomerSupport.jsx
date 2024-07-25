import React from 'react';
import './CustomerService.css'; // 스타일을 위한 CSS 파일을 추가로 만듭니다.
import logo from '../img/tikitakalogo.png'; 

const CustomerService = () => {
  return (
    <div className="customer-service">
      <div className="logo-container">
        <img src={logo} alt="티키타카 로고" className="logo" />
      </div>
      <div className="notice-box">
        <div className="notice-header">NOTICE</div>
        <div className="notice-content">
          <h1>고객센터 운영시간 단축 안내</h1>
          <p>10:00~12:00</p>
          <hr />
          <p>
            올 한 해도 언제나처럼 저희 티키타카를 이용해 주셔서 감사합니다.
            12월 31일 연말 고객센터 및 B2B 상담이 12시까지 운영됩니다.
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

export default CustomerService;

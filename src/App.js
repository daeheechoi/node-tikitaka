import './App.css';
import { useState, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import MainApp from './components/MainApp';
import Writing from './components/Writing'; // Writing 컴포넌트 import
import Cookies from 'js-cookie'; // 쿠키 관리를 위한 js-cookie 라이브러리 사용
import logo from './img/tikitakalogo.png';

function App() {
  const [mode, setMode] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    // 쿠키에서 userName 가져오기
    const userName = Cookies.get('userName');
    if (userName) {
      setMode("WELCOME");
      setName(userName); // 이름 설정
      navigate('/app');
    } else {
      fetch('https://192.168.6.45:3001/authcheck', {
        method: 'GET',
        credentials: 'include' // 쿠키를 전송하기 위해 설정
      })
      .then(res => res.json())
      .then(json => {
        if (json.isLogin === "True") {
          setMode("WELCOME");
          setName(json.name); // 이름 설정
          navigate('/app'); // 로그인 되어 있으면 /app 경로로 이동
        } else {
          setMode("LOGIN");
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setMode("LOGIN");
      });
    }
  }, [navigate]);

  const handleLogin = () => {
    const userData = { phone, userPassword: password };
    fetch("https://192.168.6.45:3001/login", {
      method: "post",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(userData),
      credentials: 'include' // 쿠키를 전송하기 위해 설정
    })
    .then(res => res.json())
    .then(json => {            
      if (json.isLogin === "True") {
        setMode("WELCOME");
        setName(json.name); // 이름 설정
        Cookies.set('userName', json.name, { expires: 1 }); // 쿠키에 사용자 이름 설정 (1일 동안 유지)
        navigate('/app'); // 로그인 성공 시 /app 경로로 이동
      } else {
        alert(json.isLogin);
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  };

  const handleSignup = () => {
    const userData = { name, email, phone, userPassword: password, userPassword2: password2 };
    fetch("https://192.168.6.45:3001/signin", {
      method: "post",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(userData),
      credentials: 'include' // 쿠키를 전송하기 위해 설정
    })
    .then(res => res.json())
    .then(json => {
      if (json.isSuccess === "True") {
        alert('회원가입이 완료되었습니다!');
        setMode("LOGIN");
        resetForm();
      } else {
        alert(json.isSuccess);
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setPassword2("");
  };

  const switchToSignup = () => {
    setMode("SIGNIN");
    resetForm();
  };

  const switchToLogin = () => {
    setMode("LOGIN");
    resetForm();
  };

  const handleLogout = () => {
    fetch('https://192.168.6.45:3001/logout', {
      method: 'POST',
      credentials: 'include'
    })
    .then(res => res.json())
    .then(json => {
      if (json.isLogout === "True") {
        setMode("LOGIN");
        setName("");
        Cookies.remove('userName'); // 로그아웃 시 쿠키 삭제
        navigate('/');
      } else {
        alert("로그아웃 실패");
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  };

  let content = null;

  if (mode === "LOGIN") {
    content = (
      <>
        <img src={logo} alt="티키타카 로고" style={{ width: '150px', marginTop: '20px' }} />
        <h2 className="login-h2">로그인</h2>
        <div className="form">
          <p>
            <input
              className="login"
              type="text"
              name="phone"
              placeholder="전화번호"
              value={phone}
              onChange={event => setPhone(event.target.value)}
            />
          </p>
          <p>
            <input
              className="login"
              type="password"
              name="pwd"
              placeholder="비밀번호"
              value={password}
              onChange={event => setPassword(event.target.value)}
            />
          </p>
          <p>
            <input
              className="btn"
              type="submit"
              value="로그인"
              onClick={handleLogin}
            />
          </p>
        </div>
        <p>계정이 없으신가요? <button onClick={switchToSignup} className="login-button">회원가입</button></p>
      </>
    );
  } else if (mode === 'SIGNIN') {
    content = (
      <>
        <h2 className="signup-h2">회원가입</h2>
        <div className="form">
          <p>
            <input
              className="login"
              type="text"
              placeholder="이름"
              value={name}
              onChange={event => setName(event.target.value)}
            />
          </p>
          <p>
            <input
              className="login"
              type="email"
              placeholder="이메일"
              value={email}
              onChange={event => setEmail(event.target.value)}
            />
          </p>
          <p>
            <input
              className="login"
              type="text"
              placeholder="전화번호"
              value={phone}
              onChange={event => setPhone(event.target.value)}
            />
          </p>
          <p>
            <input
              className="login"
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={event => setPassword(event.target.value)}
            />
          </p>
          <p>
            <input
              className="login"
              type="password"
              placeholder="비밀번호 확인"
              value={password2}
              onChange={event => setPassword2(event.target.value)}
            />
          </p>
          <p>
            <input
              className="btn"
              type="submit"
              value="회원가입"
              onClick={handleSignup}
            />
          </p>
        </div>
        <p>로그인화면으로 돌아가기 <button onClick={switchToLogin} className="login-button">로그인</button></p>
      </>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<div className="background">{content}</div>} />
      <Route path="/app" element={<MainApp userName={name} onLogout={handleLogout} />} /> {/* MainApp에 name과 로그아웃 함수 전달 */}
      <Route path="/writing" element={<Writing userName={name} />} /> {/* Writing 컴포넌트 라우트 추가 */}
    </Routes>
  );
}

export default App;

import React, { useState } from 'react';
import './Roulette.css'; // 스타일을 위한 CSS 파일

const Roulette = () => {
  const [result, setResult] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const options = ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5'];

  const spin = () => {
    setSpinning(true);
    const selectedOption = options[Math.floor(Math.random() * options.length)];
    const optionIndex = options.indexOf(selectedOption);
    const newRotation = rotation + 360 * 4 + (optionIndex * (360 / options.length));
    setRotation(newRotation);
    setTimeout(() => {
      setResult(selectedOption);
      setSpinning(false);
    }, 4000); // 4초 후에 결과 표시
  };

  return (
    <div className="roulette-container">
      <h1>돌림판</h1>
      <div className="roulette-wheel" style={{ transform: `rotate(${rotation}deg)` }}>
        {options.map((option, index) => (
          <div key={index} className="roulette-option">
            {option}
          </div>
        ))}
      </div>
      <button onClick={spin} disabled={spinning}>
        {spinning ? '돌리는 중...' : '돌리기'}
      </button>
      {result && <div className="roulette-result">결과: {result}</div>}
    </div>
  );
};

export default Roulette;

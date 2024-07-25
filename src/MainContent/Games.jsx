import React, { useRef, useEffect } from 'react';
import './Games.css'; // 스타일을 위한 CSS 파일

const Games = () => {
  const canvasRef = useRef(null);
  const shipRef = useRef({ x: 250, y: 450, width: 50, height: 50 });
  const enemiesRef = useRef([]);
  const bulletsRef = useRef([]);
  const gameLoopRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const handleKeyDown = (e) => {
      const ship = shipRef.current;
      if (e.key === 'ArrowLeft' && ship.x > 0) {
        ship.x -= 10;
      } else if (e.key === 'ArrowRight' && ship.x < canvas.width - ship.width) {
        ship.x += 10;
      } else if (e.key === ' ') {
        bulletsRef.current.push({ x: ship.x + ship.width / 2, y: ship.y, width: 5, height: 10 });
      }
    };

    const drawShip = () => {
      const ship = shipRef.current;
      ctx.fillStyle = 'blue';
      ctx.fillRect(ship.x, ship.y, ship.width, ship.height);
    };

    const drawEnemies = () => {
      ctx.fillStyle = 'red';
      enemiesRef.current.forEach(enemy => {
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        enemy.y += 2;
      });
    };

    const drawBullets = () => {
      ctx.fillStyle = 'green';
      bulletsRef.current.forEach((bullet, index) => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        bullet.y -= 5;
        if (bullet.y < 0) {
          bulletsRef.current.splice(index, 1);
        }
      });
    };

    const detectCollisions = () => {
      bulletsRef.current.forEach((bullet, bulletIndex) => {
        enemiesRef.current.forEach((enemy, enemyIndex) => {
          if (bullet.x < enemy.x + enemy.width &&
              bullet.x + bullet.width > enemy.x &&
              bullet.y < enemy.y + enemy.height &&
              bullet.y + bullet.height > enemy.y) {
            bulletsRef.current.splice(bulletIndex, 1);
            enemiesRef.current.splice(enemyIndex, 1);
          }
        });
      });
    };

    const gameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawShip();
      drawEnemies();
      drawBullets();
      detectCollisions();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    const spawnEnemies = () => {
      enemiesRef.current.push({ x: Math.random() * 450, y: 0, width: 50, height: 50 });
    };

    document.addEventListener('keydown', handleKeyDown);
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    const enemySpawnInterval = setInterval(spawnEnemies, 2000);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(gameLoopRef.current);
      clearInterval(enemySpawnInterval);
    };
  }, []);

  return (
    <div>
      <h1>Galaga 게임</h1>
      <canvas ref={canvasRef} width={500} height={500} style={{ backgroundColor: 'black' }} />
    </div>
  );
};

export default Games;

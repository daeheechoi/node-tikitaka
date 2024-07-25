import React, { useEffect, useState } from 'react';
import './DiaryContent.css'; // CSS 파일을 import

const DiaryContent = () => {
    const [diaries, setDiaries] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [mood, setMood] = useState('');
    const author = 'Author Name'; // 실제 작성자 정보를 여기에 설정하세요.

    useEffect(() => {
        fetch('/diaries')
            .then(res => res.json())
            .then(data => setDiaries(data))
            .catch(err => console.error('Failed to fetch diaries:', err));
    }, []);

    const handleDelete = (id) => {
        fetch('/delete-diary', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id }),
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setDiaries(diaries.filter(diary => diary.id !== id));
                } else {
                    console.error('Failed to delete diary entry:', data.error);
                }
            })
            .catch(err => console.error('Failed to delete diary entry:', err));
    };

    const handleCreate = (e) => {
        e.preventDefault();
        if (!title || !content || !mood) {
            alert('제목, 내용, 기분을 입력하세요.');
            return;
        }
        const diaryEntry = { title, content, mood, author };
        console.log('Sending data:', diaryEntry);

        fetch('/create-diary', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(diaryEntry),
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok.');
                }
                return res.json();
            })
            .then(data => {
                if (data.success) {
                    setDiaries([...diaries, { id: data.id, title, content, mood, date: new Date() }]);
                    setIsCreating(false);
                    setTitle('');
                    setContent('');
                    setMood('');
                } else {
                    console.error('Failed to create diary entry:', data.error);
                }
            })
            .catch(err => console.error('Failed to create diary entry:', err));
    };

    const getMoodColor = (mood) => {
        switch (mood) {
            case 'Happy':
                return 'linear-gradient(to right, #a1c4fd, #c2e9fb)'; // 파스텔톤 신남
            case 'Good':
                return 'linear-gradient(to right, #d4fc79, #96e6a1)'; // 파스텔톤 좋음
            case 'Normal':
                return 'linear-gradient(to right, #fddb92, #d1fdff)'; // 파스텔톤 보통
            case 'Bad':
                return 'linear-gradient(to right, #feb47b, #ff7e5f)'; // 파스텔톤 나쁨
            case 'Awful':
                return 'linear-gradient(to right, #ff9a9e, #fecfef)'; // 파스텔톤 끔찍
            default:
                return '#ffffff'; // 기본 배경 색상
        }
    };

    const getMoodColorClass = (mood) => {
        switch (mood) {
            case 'Happy':
                return 'Happy';
            case 'Good':
                return 'Good';
            case 'Normal':
                return 'Normal';
            case 'Bad':
                return 'Bad';
            case 'Awful':
                return 'Awful';
            default:
                return '';
        }
    };

    return (
        <div className="container">
            <header className="header">
                <h1>다이어리</h1>
                <div className="header-buttons">
                    <button onClick={() => setIsCreating(true)}>새 일기 쓰기</button>
                </div>
            </header>
            {isCreating && (
                <form onSubmit={handleCreate} className="diary-form">
                    <div className="form-group">
                        <label>제목:</label>
                        <input 
                            type="text" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                        />
                    </div>
                    <div className="form-group">
                        <label>내용:</label>
                        <textarea 
                            value={content} 
                            onChange={(e) => setContent(e.target.value)} 
                        />
                    </div>
                    <div className="form-group">
                        <label>기분:</label>
                        <div className="mood-buttons">
                            <button
                                type="button"
                                className={`mood-button ${mood === 'Happy' ? 'selected' : ''} Happy`}
                                onClick={() => setMood('Happy')}
                            >😊 신남</button>
                            <button
                                type="button"
                                className={`mood-button ${mood === 'Good' ? 'selected' : ''} Good`}
                                onClick={() => setMood('Good')}
                            >🙂 좋음</button>
                            <button
                                type="button"
                                className={`mood-button ${mood === 'Normal' ? 'selected' : ''} Normal`}
                                onClick={() => setMood('Normal')}
                            >😐 보통</button>
                            <button
                                type="button"
                                className={`mood-button ${mood === 'Bad' ? 'selected' : ''} Bad`}
                                onClick={() => setMood('Bad')}
                            >🙁 나쁨</button>
                            <button
                                type="button"
                                className={`mood-button ${mood === 'Awful' ? 'selected' : ''} Awful`}
                                onClick={() => setMood('Awful')}
                            >😡 끔찍</button>
                        </div>
                    </div>
                    <div className="form-buttons">
                        <button type="submit">등록</button>
                        <button type="button" className="cancel-button" onClick={() => setIsCreating(false)}>취소</button>
                    </div>
                </form>
            )}
            <div>
                {diaries.length > 0 ? (
                    diaries.map(diary => (
                        <div key={diary.id} className={`diary-item ${getMoodColorClass(diary.mood)}`} style={{ background: getMoodColor(diary.mood) }}>
                            <h2>{new Date(diary.date).toLocaleDateString()}</h2>
                            <p>{diary.content}</p>
                            <div className="diary-controls">
                                <button onClick={() => handleDelete(diary.id)}>삭제</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>일기 항목이 없습니다.</p>
                )}
            </div>
        </div>
    );
};

export default DiaryContent;

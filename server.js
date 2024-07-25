const express = require('express');
const session = require('express-session');
const path = require('path');
const cors = require('cors');
const MySQLStore = require('express-mysql-session')(session);
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const multer = require('multer');
const db = require('./lib/db');
const sessionOption = require('./lib/sessionOption');
const fs = require('fs');
const https = require('https');
const slugify = require('slugify');
const socketIo = require('socket.io');

const app = express();
const port = 3001;

// SSL 자격 증명
const privateKey = fs.readFileSync('./localhost+1-key.pem', 'utf8');
const certificate = fs.readFileSync('./localhost+1.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// CORS 옵션
const corsOptions = {
    origin: [
        'https://gudrle.dothome.co.kr',
        'https://localhost:3000',
        'https://192.168.6.78:3001',
        'https://192.168.6.78:3001',
        'https://192.168.6.17:3001'
    ],
    credentials: true
};
app.use(cors(corsOptions));

// 미들웨어 설정
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'build')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public'))); 

// 세션 스토어
const sessionStore = new MySQLStore(sessionOption);
app.use(session({
    key: 'session_cookie_name',
    secret: '~',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        httpOnly: true
    }
}));

const authenticateUser = (req, res, next) => {
    if (!req.session.is_logined) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// 인증 확인 엔드포인트
app.get('/authcheck', (req, res) => {
    const sendData = { isLogin: "", name: "" };
    const userName = req.cookies.userName;

    if (req.session.is_logined) {
        sendData.isLogin = "True";
        sendData.name = req.session.nickname;
        res.json(sendData);
    } else if (userName) {
        db.query('SELECT id, username FROM user WHERE username = ?', [userName], (error, results) => {
            if (error) {
                console.error('Database query error:', error);
                return res.status(500).json({ error: 'Database query error' });
            }
            if (results.length > 0) {
                req.session.is_logined = true;
                req.session.user_id = results[0].id;
                req.session.nickname = results[0].username;

                req.session.save((err) => {
                    if (err) {
                        console.error('Session save error:', err);
                        return res.status(500).json({ error: 'Session save error' });
                    }
                    sendData.isLogin = "True";
                    sendData.name = results[0].username;
                    res.json(sendData);
                });
            } else {
                sendData.isLogin = "False";
                res.json(sendData);
            }
        });
    } else {
        sendData.isLogin = "False";
        res.json(sendData);
    }
});

// 로그아웃 엔드포인트
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        res.json({ isLogout: "True" });
    });
});

// 로그인 엔드포인트
app.post("/login", (req, res) => {
    const { phone, userPassword } = req.body;
    const sendData = { isLogin: "" };

    if (phone && userPassword) {
        db.query('SELECT * FROM user WHERE phone = ?', [phone], (error, results) => {
            if (error) return res.status(500).json({ error: 'Database query error' });
            if (results.length > 0) {
                bcrypt.compare(userPassword, results[0].password, (err, result) => {
                    if (result) {
                        req.session.is_logined = true;
                        req.session.user_id = results[0].id;
                        req.session.nickname = results[0].username;
                        req.session.save(() => {
                            sendData.isLogin = "True";
                            sendData.name = results[0].username;
                            res.json(sendData);
                        });
                    } else {
                        sendData.isLogin = "로그인 정보가 일치하지 않습니다.";
                        res.json(sendData);
                    }
                });
            } else {
                sendData.isLogin = "전화번호 정보가 일치하지 않습니다.";
                res.json(sendData);
            }
        });
    } else {
        sendData.isLogin = "전화번호와 비밀번호를 입력하세요!";
        res.json(sendData);
    }
});

// 회원가입 엔드포인트
app.post("/signin", (req, res) => {
    const { userPassword, userPassword2, name, email, phone } = req.body;
    const sendData = { isSuccess: "" };

    if (phone && userPassword && userPassword2 && name && email) {
        db.query('SELECT * FROM user WHERE phone = ?', [phone], (error, results) => {
            if (error) return res.status(500).json({ error: 'Database query error' });
            if (results.length <= 0 && userPassword === userPassword2) {
                const hashedPassword = bcrypt.hashSync(userPassword, 10);
                db.query('INSERT INTO user (username, password, email, phone) VALUES (?, ?, ?, ?)', [name, hashedPassword, email, phone], (error) => {
                    if (error) return res.status(500).json({ error: 'Database query error' });
                    sendData.isSuccess = "True";
                    res.json(sendData);
                });
            } else if (userPassword !== userPassword2) {
                sendData.isSuccess = "입력된 비밀번호가 서로 다릅니다.";
                res.json(sendData);
            } else {
                sendData.isSuccess = "이미 존재하는 전화번호 입니다!";
                res.json(sendData);
            }
        });
    } else {
        sendData.isSuccess = "모든 필드를 입력하세요!";
        res.json(sendData);
    }
});

// 프로필 목록 가져오기
app.get('/profiles', authenticateUser, (req, res) => {
    const userId = req.session.user_id;

    db.query('SELECT id, username, email, following, followers FROM user', (error, results) => {
        if (error) {
            console.error('Error fetching profiles:', error);
            return res.status(500).json({ error: 'Error fetching profiles' });
        }
        
        // following 필드를 배열로 변환
        results.forEach(user => {
            if (user.following) {
                user.following = user.following.split(',').map(Number);
            } else {
                user.following = [];
            }
        });

        res.json(results);
    });
});

// 사용자 프로필 정보 가져오기
app.get('/user/:userId', authenticateUser, (req, res) => {
    const userId = req.params.userId;

    db.query('SELECT username, email, profilePicture, followers, following FROM user WHERE id = ?', [userId], (error, results) => {
        if (error) {
            console.error('Error fetching user profile:', error);
            return res.status(500).json({ error: 'Error fetching user profile' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userProfile = results[0];
        res.json(userProfile);
    });
});

// 팔로우 기능 구현
app.post('/follow', authenticateUser, (req, res) => {
    const userId = req.session.user_id;
    const { profileId } = req.body;

    if (!userId || !profileId) {
        return res.status(400).json({ error: 'Invalid request' });
    }

    db.query('SELECT following FROM user WHERE id = ?', [userId], (error, results) => {
        if (error || results.length === 0) {
            return res.status(500).json({ error: 'Error fetching user data' });
        }

        let following = results[0].following ? results[0].following.split(',') : [];

        if (!following.includes(profileId.toString())) {
            following.push(profileId.toString());
        }

        db.query('UPDATE user SET following = ? WHERE id = ?', [following.join(','), userId], (error) => {
            if (error) {
                return res.status(500).json({ error: 'Error updating following data' });
            }

            db.query('SELECT followers FROM user WHERE id = ?', [profileId], (error, results) => {
                if (error || results.length === 0) {
                    return res.status(500).json({ error: 'Error fetching profile data' });
                }

                let profileFollowers = results[0].followers ? results[0].followers.split(',') : [];

                if (!profileFollowers.includes(userId.toString())) {
                    profileFollowers.push(userId.toString());
                }

                db.query('UPDATE user SET followers = ? WHERE id = ?', [profileFollowers.join(','), profileId], (error) => {
                    if (error) {
                        return res.status(500).json({ error: 'Error updating followers data' });
                    }

                    console.log(`User ${userId} followed ${profileId}`);
                    res.json({ success: true });
                });
            });
        });
    });
});

// 언팔로우 기능 구현
app.post('/unfollow', authenticateUser, (req, res) => {
    const userId = req.session.user_id;
    const { profileId } = req.body;

    if (!userId || !profileId) {
        return res.status(400).json({ error: 'Invalid request' });
    }

    db.query('SELECT following FROM user WHERE id = ?', [userId], (error, results) => {
        if (error || results.length === 0) {
            return res.status(500).json({ error: 'Error fetching user data' });
        }

        let following = results[0].following ? results[0].following.split(',') : [];
        following = following.filter(follow => follow !== profileId.toString());

        db.query('UPDATE user SET following = ? WHERE id = ?', [following.join(','), userId], (error) => {
            if (error) {
                return res.status(500).json({ error: 'Error updating following data' });
            }

            db.query('SELECT followers FROM user WHERE id = ?', [profileId], (error, results) => {
                if (error || results.length === 0) {
                    return res.status(500).json({ error: 'Error fetching profile data' });
                }

                let profileFollowers = results[0].followers ? results[0].followers.split(',') : [];
                profileFollowers = profileFollowers.filter(follower => follower !== userId.toString());

                db.query('UPDATE user SET followers = ? WHERE id = ?', [profileFollowers.join(','), profileId], (error) => {
                    if (error) {
                        return res.status (500).json({ error: 'Error updating followers data' });
                    }

                    console.log(`User ${userId} unfollowed ${profileId}`);
                    res.json({ success: true });
                });
            });
        });
    });
});

// 즐겨찾기 상태 변경 API 엔드포인트 추가
app.post('/favoritefriend', authenticateUser, (req, res) => {
    const userId = req.session.user_id;
    const { profileId, isFavorite } = req.body;

    if (!userId || !profileId) {
        res.status(400).json({ error: 'Invalid request' });
        return;
    }

    db.query('SELECT favorites FROM user WHERE id = ?', [userId], (error, results) => {
        if (error || results.length === 0) {
            res.status(500).json({ error: 'Error fetching user data' });
            return;
        }

        let favorites = results[0].favorites ? results[0].favorites.split(',') : [];

        if (isFavorite) {
            if (!favorites.includes(profileId.toString())) {
                favorites.push(profileId.toString());
            }
        } else {
            favorites = favorites.filter(fav => fav !== profileId.toString());
        }

        db.query('UPDATE user SET favorites = ? WHERE id = ?', [favorites.join(','), userId], (error) => {
            if (error) {
                res.status(500).json({ error: 'Error updating favorites data' });
                return;
            }

            res.json({ success: true });
        });
    });
});

// 팔로우 중인 친구 목록 가져오기
app.get('/following', authenticateUser, (req, res) => {
    const userId = req.session.user_id;
    if (!userId) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
    }

    db.query('SELECT following FROM user WHERE id = ?', [userId], (error, results) => {
        if (error) {
            console.error('Error fetching following list:', error);
            res.status(500).json({ error: 'Error fetching following list' });
            return;
        }

        let following = results[0].following ? results[0].following.split(',') : [];
        if (following.length === 0) {
            res.json([]);
            return;
        }

        db.query('SELECT id, username, email FROM user WHERE id IN (?)', [following], (error, results) => {
            if (error) {
                console.error('Error fetching user details:', error);
                res.status(500).json({ error: 'Error fetching user details' });
                return;
            }
            res.json(results);
        });
    });
});

// 팔로워 목록 가져오기(프로필)
app.get('/followers', authenticateUser, (req, res) => {
    const userId = req.session.user_id;
    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
  
    db.query('SELECT followers FROM user WHERE id = ?', [userId], (error, results) => {
      if (error) {
        console.error('Error fetching followers list:', error);
        res.status(500).json({ error: 'Error fetching followers list' });
        return;
      }
  
      let followers = results[0].followers ? results[0].followers.split(',') : [];
      if (followers.length === 0) {
        res.json([]);
        return;
      }
  
      db.query('SELECT id, username, email FROM user WHERE id IN (?)', [followers], (error, results) => {
        if (error) {
          console.error('Error fetching user details:', error);
          res.status(500).json({ error: 'Error fetching user details' });
          return;
        }
        res.json(results);
      });
    });
  });

// 파일 업로드 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const originalName = file.originalname;
        const extension = path.extname(originalName);
        const baseName = path.basename(originalName, extension);
        const slugifiedName = slugify(baseName, { lower: true, strict: true });
        const finalName = `${Date.now()}-${slugifiedName}${extension}`;
        cb(null, finalName);
    }
});
const upload = multer({ storage });

// 프로필 사진 업로드 엔드포인트
app.post('/upload-profile-picture', upload.single('profilePicture'), (req, res) => {
    const userId = req.session.user_id;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const profilePicturePath = `/uploads/${req.file.filename}`;

    db.query('UPDATE user SET profilePicture = ? WHERE id = ?', [profilePicturePath, userId], (error) => {
        if (error) {
            console.error('Error updating profile picture:', error);
            return res.status(500).json({ error: 'Error updating profile picture' });
        }
        res.json({ success: true, profilePicturePath });
    });
});

// 사용자 정보 가져오기 엔드포인트
app.get('/user-profile', authenticateUser, (req, res) => {
    const userId = req.session.user_id;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    db.query('SELECT username, email, profilePicture, followers, following FROM user WHERE id = ?', [userId], (error, results) => {
        if (error) {
            console.error('Error fetching user profile:', error);
            return res.status(500).json({ error: 'Error fetching user profile' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userProfile = results[0];
        res.json(userProfile);
    });
});

// 다이어리 항목 생성
app.post('/create-diary', authenticateUser, (req, res) => {
    const { title, content, mood, author } = req.body;

    console.log('Received data:', req.body);

    if (!title || !content || !mood || !author) {
        return res.status(400).json({ error: '제목, 내용, 기분, 작성자는 필수 항목입니다.' });
    }

    const query = 'INSERT INTO diary (title, content, mood, author, date) VALUES (?, ?, ?, ?, NOW())';
    db.query(query, [title, content, mood, author], (error, results) => {
        if (error) {
            console.error('다이어리 항목 생성 중 오류 발생:', error);
            return res.status(500).json({ error: '다이어리 항목 생성 중 오류 발생' });
        } else {
            res.status(200).json({ success: true, message: '다이어리 항목이 성공적으로 생성되었습니다.', id: results.insertId });
        }
    });
});

// 다이어리 항목 가져오기
app.get('/diaries', authenticateUser, (req, res) => {
    const query = 'SELECT * FROM diary ORDER BY date DESC';
    db.query(query, (error, results) => {
        if (error) {
            console.error('다이어리 항목 가져오기 중 오류 발생:', error);
            res.status(500).json({ error: '다이어리 항목 가져오기 중 오류 발생' });
        } else {
            res.json(results);
        }
    });
});

// 다이어리 항목 수정
app.post('/update-diary', authenticateUser, (req, res) => {
    const { id, title, content } = req.body;
    if (!id || !title || !content) {
        return res.status(400).json({ error: 'ID, 제목, 내용은 필수 항목입니다.' });
    }

    const query = 'UPDATE diary SET title = ?, content = ? WHERE id = ?';
    db.query(query, [title, content, id], (error, results) => {
        if (error) {
            console.error('다이어리 항목 수정 중 오류 발생:', error);
            return res.status(500).json({ error: '다이어리 항목 수정 중 오류 발생' });
        } else {
            res.status(200).json({ success: true, message: '다이어리 항목이 성공적으로 수정되었습니다.' });
        }
    });
});

// 다이어리 항목 삭제
app.post('/delete-diary', authenticateUser, (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ error: 'ID는 필수 항목입니다.' });
    }

    const query = 'DELETE FROM diary WHERE id = ?';
    db.query(query, [id], (error, results) => {
        if (error) {
            console.error('다이어리 항목 삭제 중 오류 발생:', error);
            return res.status(500).json({ error: '다이어리 항목 삭제 중 오류 발생' });
        } else {
            res.status(200).json({ success: true, message: '다이어리 항목이 성공적으로 삭제되었습니다.' });
        }
    });
});

// 이미지 업로드 엔드포인트
app.post('/upload-image', upload.single('image'), (req, res) => {
    res.json({ imagePath: `/uploads/${req.file.filename}` });
});

app.post('/upload-video', upload.single('video'), (req, res) => {
    res.json({ videoPath: `/uploads/${req.file.filename}` });
});

app.post('/upload-file', upload.single('file'), (req, res) => {
    res.json({ filePath: `/uploads/${req.file.filename}` });
});

// 게시물 생성 엔드포인트
app.post('/create-post', authenticateUser, (req, res) => {
    const { content, image, video, file, tags, author } = req.body;

    if (!content || !author) {
        return res.status(400).json({ error: 'Content and author are required' });
    }

    const query = 'INSERT INTO post (content, image, video, file, tags, author) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [content, image, video, file, tags, author], (error, results) => {
        if (error) {
            console.error('Error creating post:', error);
            return res.status(500).json({ success: false, message: 'Error creating post' });
        }
        res.status(200).json({ success: true, message: 'Post created successfully' });
    });
});

// 게시물 목록 가져오기 엔드포인트
app.get('/posts', authenticateUser, (req, res) => {
    const query = 'SELECT * FROM post ORDER BY date DESC';
    db.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching posts:', error);
            return res.status(500).json({ error: 'Error fetching posts' });
        }
        res.json(results);
    });
});

// 좋아요 상태 확인 엔드포인트
app.post('/check-like-status', authenticateUser, (req, res) => {
    const userId = req.session.user_id;
    const { postIds } = req.body;

    if (!Array.isArray(postIds)) {
        return res.status(400).json({ error: 'Invalid request' });
    }

    db.query('SELECT favorites FROM user WHERE id = ?', [userId], (error, results) => {
        if (error || results.length === 0) {
            return res.status(500).json({ error: 'Error fetching user data' });
        }

        let favorites = results[0].favorites ? results[0].favorites.split(',') : [];
        const likedPosts = postIds.filter(postId => favorites.includes(postId.toString()));
        res.json({ likedPosts });
    });
});

// 게시물 삭제 엔드포인트
app.post('/delete-post', authenticateUser, (req, res) => {
    const userId = req.session.user_id;
    const { postId } = req.body;

    db.query('DELETE FROM post WHERE id = ? AND author = (SELECT username FROM user WHERE id = ?)', [postId, userId], (error) => {
        if (error) {
            return res.status(500).json({ error: 'Error deleting post' });
        }
        res.json({ success: true });
    });
});

// 좋아요 엔드포인트
app.post('/like-post', authenticateUser, (req, res) => {
    const userId = req.session.user_id;
    const { postId } = req.body;

    if (!postId) {
        return res.status(400).json({ error: 'Invalid request' });
    }

    db.query('SELECT favorites FROM user WHERE id = ?', [userId], (error, results) => {
        if (error || results.length === 0) {
            return res.status(500).json({ error: 'Error fetching user data' });
        }

        let favorites = results[0].favorites ? results[0].favorites.split(',') : [];
        const isLiked = favorites.includes(postId.toString());

        if (isLiked) {
            favorites = favorites.filter(fav => fav !== postId.toString());
        } else {
            favorites.push(postId.toString());
        }

        db.query('UPDATE user SET favorites = ? WHERE id = ?', [favorites.join(','), userId], (error) => {
            if (error) {
                return res.status(500).json({ error: 'Error updating favorites data' });
            }

            if (!isLiked) {
                db.query('SELECT id, username FROM user WHERE username = (SELECT author FROM post WHERE id = ?)', [postId], (error, postResults) => {
                    if (error || postResults.length === 0) {
                        return res.status(500).json({ error: 'Error fetching post data' });
                    }

                    const postAuthorId = postResults[0].id;
                    const postAuthorUsername = postResults[0].username;
                    if (postAuthorId !== userId) {
                        const notificationQuery = 'INSERT INTO notifications (userId, postId, userName, message, timeAgo, type) VALUES (?, ?, ?, ?, ?, ?)';
                        const message = `${req.session.nickname}님이 ${new Date().toLocaleTimeString()}에 좋아요를 눌렀습니다.`;
                        db.query(notificationQuery, [postAuthorId, postId, req.session.nickname, message, '방금', 'like'], (error) => {
                            if (error) {
                                console.error('Error creating notification:', error);
                                return res.status(500).json({ error: 'Error creating notification' });
                            }
                            res.json({ success: true });
                        });
                    } else {
                        res.json({ success: true });
                    }
                });
            } else {
                res.json({ success: true });
            }
        });
    });
});


// 좋아요 수 카운트 엔드포인트
app.post('/like-count', authenticateUser, (req, res) => {
    const { postId } = req.body;

    if (!postId) {
        return res.status(400).json({ error: 'Invalid request' });
    }

    db.query('SELECT favorites FROM user', (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error fetching data' });
        }

        let likeCount = 0;
        results.forEach(row => {
            let favorites = row.favorites ? row.favorites.split(',') : [];
            if (favorites.includes(postId.toString())) {
                likeCount++;
            }
        });

        res.json({ likeCount });
    });
});

// 좋아요한 사용자 목록 엔드포인트
app.post('/liked-users', authenticateUser, (req, res) => {
    const { postId } = req.body;

    if (!postId) {
        return res.status(400).json({ error: 'Invalid request' });
    }

    db.query('SELECT username FROM user WHERE FIND_IN_SET(?, favorites)', [postId], (error, results) => {
        if (error) {
            return res.status (500).json({ error: 'Error fetching data' });
        }

        const likedUsers = results.map(row => row.username);
        res.json({ likedUsers });
    });
});

// 알림 목록 가져오기 엔드포인트
app.get('/notifications', authenticateUser, (req, res) => {
    const userId = req.session.user_id;

    db.query('SELECT * FROM notifications WHERE userId = ? AND is_read = FALSE', [userId], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error fetching notifications' });
        }

        res.json(results);
    });
});

// 알림 읽음 처리 엔드포인트
app.post('/mark-notifications-read', authenticateUser, (req, res) => {
    const userId = req.session.user_id;

    db.query('UPDATE notifications SET is_read = TRUE WHERE userId = ?', [userId], (error) => {
        if (error) {
            return res.status(500).json({ error: 'Error updating notifications' });
        }
        res.json({ success: true });
    });
});

// 알림 생성 엔드포인트
app.post('/notify', authenticateUser, (req, res) => {
    const { recipientId, message, postId, type } = req.body;
    const senderName = req.session.nickname;

    if (!recipientId || !message || !senderName) {
        return res.status(400).json({ error: 'Invalid request' });
    }

    let query;
    let params;

    if (type === 'message') {
        query = 'INSERT INTO notifications (userId, userName, message, timeAgo) VALUES (?, ?, ?, ?)';
        params = [recipientId, senderName, message, '방금'];
    } else if (postId) {
        query = 'INSERT INTO notifications (userId, postId, userName, message, timeAgo) VALUES (?, ?, ?, ?, ?)';
        params = [recipientId, postId, senderName, message, '방금'];
    } else {
        query = 'INSERT INTO notifications (userId, userName, message, timeAgo) VALUES (?, ?, ?, ?)';
        params = [recipientId, senderName, message, '방금'];
    }

    db.query(query, params, (error) => {
        if (error) {
            console.error('Error creating notification:', error);
            return res.status(500).json({ error: 'Error creating notification' });
        }
        res.status(200).json({ success: true, message: 'Notification sent successfully' });
    });
});

// 댓글 생성 엔드포인트
app.post('/comments', authenticateUser, (req, res) => {
    const { postId, content } = req.body;
    const author = req.session.nickname;

    if (!postId || !content || !author) {
        return res.status(400).json({ error: 'Invalid request' });
    }

    const query = 'INSERT INTO comments (postId, author, content) VALUES (?, ?, ?)';
    db.query(query, [postId, author, content], (error, results) => {
        if (error) {
            console.error('Error creating comment:', error);
            return res.status(500).json({ error: 'Error creating comment' });
        }
        res.status(200).json({ success: true, message: 'Comment created successfully' });
    });
});

// 댓글 가져오기 엔드포인트
app.get('/comments/:postId', authenticateUser, (req, res) => {
    const { postId } = req.params;

    const query = 'SELECT * FROM comments WHERE postId = ? ORDER BY date DESC';
    db.query(query, [postId], (error, results) => {
        if (error) {
            console.error('Error fetching comments:', error);
            return res.status(500).json({ error: 'Error fetching comments' });
        }
        res.json(results);
    });
});

// 메시지 읽음으로 표시
app.post('/chat/read', authenticateUser, (req, res) => {
    const { messageId } = req.body;

    const query = 'UPDATE chat SET is_read = TRUE WHERE id = ?';
    db.query(query, [messageId], (error, results) => {
        if (error) {
            console.error('Error marking message as read:', error);
            return res.status(500).json({ error: 'Error marking message as read' });
        }
        res.status(200).json({ success: true, message: 'Message marked as read' });
    });
});

// 특정 사용자의 세부 정보 가져오기
app.get('/user/:userId', authenticateUser, (req, res) => {
    const { userId } = req.params;

    db.query('SELECT id, username FROM user WHERE id = ?', [userId], (error, results) => {
        if (error || results.length === 0) {
            return res.status(500).json({ error: 'Error fetching user data' });
        }
        res.json(results[0]);
    });
});

// 특정 사용자가 주고받은 메시지 가져오기
app.get('/chat/:recipientId', authenticateUser, (req, res) => {
    const { recipientId } = req.params;
    const senderId = req.session.user_id;

    const query = `
        SELECT chat.*, user.username AS senderName, recipientUser.username AS recipientName
        FROM chat
        JOIN user ON chat.sender = user.id
        JOIN user AS recipientUser ON chat.recipient = recipientUser.id
        WHERE (chat.sender = ? AND chat.recipient = ?) OR (chat.sender = ? AND chat.recipient = ?)
        ORDER BY chat.date
    `;
    db.query(query, [senderId, recipientId, recipientId, senderId], (error, results) => {
        if (error) {
            console.error('Error fetching chat messages:', error);
            return res.status(500).json({ error: 'Error fetching chat messages' });
        }
        res.json(results);
    });
});

// 채팅 메시지 저장 엔드포인트
app.post('/chat', authenticateUser, (req, res) => {
    const { content, recipientId } = req.body;
    const senderId = req.session.user_id;

    if (!content || !recipientId || !senderId) {
        return res.status(400).json({ error: 'Content, recipient, and sender are required' });
    }

    const query = 'INSERT INTO chat (content, sender, recipient) VALUES (?, ?, ?)';
    db.query(query, [content, senderId, recipientId], (error, results) => {
        if (error) {
            console.error('Error saving chat message:', error);
            return res.status(500).json({ error: 'Error saving chat message' });
        }
        res.status(200).json({ success: true, message: 'Message sent successfully' });
    });
});

// 기존 코드에 추가합니다.
app.post('/api/messages', authenticateUser, (req, res) => {
    const { content, author } = req.body;

    if (!content || !author) {
        return res.status(400).json({ error: 'Content and author are required' });
    }

    const query = 'INSERT INTO community (content, author) VALUES (?, ?)';
    db.query(query, [content, author], (error) => {
        if (error) {
            console.error('Error creating message:', error);
            return res.status(500).json({ success: false, message: 'Error creating message' });
        }
        res.status(200).json({ success: true, message: 'Message created successfully' });
    });
});

// 메시지 가져오기 엔드포인트
app.get('/api/messages', authenticateUser, (req, res) => {
    const query = 'SELECT * FROM community ORDER BY id DESC';
    db.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching messages:', error);
            return res.status(500).json({ error: 'Error fetching messages' });
        }
        res.json(results);
    });
});

// 검색 엔드포인트
app.get('/api/search', authenticateUser, (req, res) => {
    const searchQuery = req.query.query;

    const userSearchQuery = `SELECT id, username AS title, email AS description, 'user' AS type, NULL AS tags, NULL AS author, NULL AS date, NULL AS image FROM user WHERE username LIKE ?`;
    const postSearchQuery = `SELECT id, content AS title, content AS description, 'post' AS type, tags, author, date, image FROM post WHERE content LIKE ?`;

    db.query(`${userSearchQuery} UNION ${postSearchQuery}`, [`%${searchQuery}%`, `%${searchQuery}%`], (error, results) => {
        if (error) {
            console.error('Error fetching search results:', error);
            return res.status(500).json({ error: 'Error fetching search results' });
        }
        const users = results.filter(result => result.type === 'user');
        const posts = results.filter(result => result.type === 'post');
        res.json({ users, posts });
    });
});

// 모든 비-API 요청을 React 앱의 index.html로 리디렉트
app.get('*', (req, res) => {
    const isApiRequest = req.originalUrl.startsWith('/api');
    if (isApiRequest) {
        res.status(404).json({ error: 'Not Found' });
    } else {
        res.sendFile(path.join(__dirname, 'build', 'index.html'));
    }
});


// HTTPS 서버 생성 및 소켓 연결
const server = https.createServer(credentials, app);
const io = socketIo(server);

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('joinRoom', (room) => {
        socket.join(room);
        console.log(`Client joined room: ${room}`);
    });

    socket.on('leaveRoom', (room) => {
        socket.leave(room);
        console.log(`Client left room: ${room}`);
    });

    socket.on('sendMessage', (data) => {
        const { content, sender, recipient } = data;
        const query = 'INSERT INTO chat (content, sender, recipient) VALUES (?, ?, ?)';
        db.query(query, [content, sender, recipient], (error, results) => {
            if (error) {
                console.error('Error saving chat message:', error);
                return;
            }
            io.to(recipient).emit('receiveMessage', data);
            io.to(sender).emit('receiveMessage', data);
        });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(port, '0.0.0.0', () => {
    console.log(`Server listening at https://192.168.6.45:${port}`);
});


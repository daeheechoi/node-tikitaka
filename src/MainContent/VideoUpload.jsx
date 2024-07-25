import React, { useState } from 'react';
import axios from 'axios';

const VideoUpload = ({ userName }) => {
  const [video, setVideo] = useState(null);
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  const handleVideoChange = (event) => {
    setVideo(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!video) {
      alert('비디오를 선택하세요.');
      return;
    }

    const formData = new FormData();
    formData.append('video', video);

    try {
      const uploadRes = await axios.post('https://192.168.6.45:3001/upload-video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const videoPath = uploadRes.data.videoPath;

      const postRes = await axios.post('https://192.168.6.45:3001/create-post', {
        content,
        video: videoPath,
        tags,
        author: userName
      });

      if (postRes.data.success) {
        alert('비디오가 성공적으로 업로드되었습니다.');
        setContent('');
        setVideo(null);
        setTags('');
      } else {
        alert('비디오 업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('비디오 업로드 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="video-upload-form">
      <h2>비디오 업로드</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleVideoChange} />
        <textarea
          placeholder="내용을 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <input
          type="text"
          placeholder="태그 (쉼표로 구분)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <button type="submit">업로드</button>
      </form>
    </div>
  );
};

export default VideoUpload;

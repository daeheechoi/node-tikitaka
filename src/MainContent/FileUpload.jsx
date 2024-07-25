import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Writing = ({ userName }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [file, setFile] = useState(null);
  const [tags, setTags] = useState('');
  const navigate = useNavigate();

  const handleImageChange = (event) => {
    setImage(event.target.files[0]);
  };

  const handleVideoChange = (event) => {
    setVideo(event.target.files[0]);
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const uploadFile = async (file, endpoint) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const uploadRes = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return uploadRes.data.filePath;
    } catch (error) {
      console.error(`Error uploading ${file.type}:`, error);
      throw new Error(`파일 업로드 중 오류가 발생했습니다.`);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    let imagePath = '';
    let videoPath = '';
    let filePath = '';

    try {
      if (image) imagePath = await uploadFile(image, 'https://192.168.6.45:3001/upload-image');
      if (video) videoPath = await uploadFile(video, 'https://192.168.6.45:3001/upload-video');
      if (file) filePath = await uploadFile(file, 'https://192.168.6.45:3001/upload-file');

      const response = await axios.post('https://192.168.6.45:3001/create-post', {
        content,
        image: imagePath,
        video: videoPath,
        file: filePath,
        tags,
        author: userName,
      });

      if (response.data.success) {
        alert('글이 성공적으로 작성되었습니다.');
        setContent('');
        setImage(null);
        setVideo(null);
        setFile(null);
        setTags('');
        navigate('/app');
      } else {
        alert('글 작성에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert(error.message);
    }
  };

  return (
    <div className="writing-form">
      <h2>파일 업로드</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="내용을 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        ></textarea>
        <input
          type="file"
          accept=".zip,.rar,.7z,.tar,.gz"
          onChange={handleFileChange}
        />
        <input
          type="text"
          placeholder="태그 (쉼표로 구분)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <button type="submit">제출</button>
      </form>
    </div>
  );
};

export default Writing;

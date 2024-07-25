// import React, { useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const Writing = ({ userName }) => {
//   const [content, setContent] = useState('');
//   const [image, setImage] = useState(null);
//   const [tags, setTags] = useState('');
//   const navigate = useNavigate();

//   const handleImageChange = (event) => {
//     setImage(event.target.files[0]);
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     let imagePath = '';

//     if (image) {
//       const formData = new FormData();
//       formData.append('image', image);

//       try {
//         const uploadRes = await axios.post('http://192.168.6.78:3001/upload-image', formData, {
//           headers: {
//             'Content-Type': 'multipart/form-data'
//           }
//         });
//         imagePath = uploadRes.data.imagePath;
//       } catch (error) {
//         console.error('Error uploading image:', error);
//         alert('이미지 업로드 중 오류가 발생했습니다.');
//         return;
//       }
//     }

//     try {
//       const response = await axios.post('http://192.168.6.78:3001/create-post', {
//         content,
//         image: imagePath,
//         tags,
//         author: userName,
//       });
//       if (response.data.success) {
//         alert('글이 성공적으로 작성되었습니다.');
//         setContent('');
//         setImage(null);
//         setTags('');
//         navigate('/app');
//       } else {
//         alert('글 작성에 실패했습니다.');
//       }
//     } catch (error) {
//       console.error('Error creating post:', error);
//       alert('글 작성 중 오류가 발생했습니다.');
//     }
//   };

//   return (
//     <div className="writing-form">
//       <h2>글쓰기</h2>
//       <form onSubmit={handleSubmit}>
//         <textarea
//           placeholder="내용을 입력하세요"
//           value={content}
//           onChange={(e) => setContent(e.target.value)}
//         ></textarea>
//         <input
//           type="file"
//           accept="image/*"
//           onChange={handleImageChange}
//         />
//         <input
//           type="text"
//           placeholder="태그 (쉼표로 구분)"
//           value={tags}
//           onChange={(e) => setTags(e.target.value)}
//         />
//         <button type="submit">제출</button>
//       </form>
//     </div>
//   );
// };

// export default Writing;

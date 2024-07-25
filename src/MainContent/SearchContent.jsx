import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SearchContent = ({ searchQuery }) => {
  const [userResults, setUserResults] = useState([]);
  const [postResults, setPostResults] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      console.log(`Fetching search results for query: ${searchQuery}`);
      try {
        const response = await axios.get(`https://192.168.6.45:3001/api/search?query=${searchQuery}`, {
          withCredentials: true
        });
        const results = response.data;

        // 데이터 형식 로그 출력
        console.log('Search results:', results);

        // 응답이 HTML인지 확인하는 코드
        if (typeof results === 'string' && results.startsWith('<!doctype html>')) {
          throw new Error('Received HTML response instead of JSON');
        }

        // 데이터 형식에 맞게 처리
        if (results.users && Array.isArray(results.users) && results.posts && Array.isArray(results.posts)) {
          setUserResults(results.users);
          setPostResults(results.posts);

          console.log(`User results: ${JSON.stringify(results.users)}`);
          console.log(`Post results: ${JSON.stringify(results.posts)}`);
        } else {
          throw new Error('Search results are not in the expected format');
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
        setError(error);
        alert(`Error fetching search results: ${error.message}`); // 오류 발생 시 알림
      }
    };

    if (searchQuery) {
      fetchResults();
    }
  }, [searchQuery]);

  if (error) {
    return <div>Error fetching search results: {error.message}</div>;
  }

  const resultStyle = {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '16px',
    margin: '8px 4px',
  };

  return (
    <div>
      {userResults.length > 0 && (
        <div>
          <h2>User Results</h2>
          {userResults.map((result, index) => (
            <div key={index} style={resultStyle}>
              <h3>{result.title}</h3>
              <p><strong>Email:</strong> {result.description}</p>
            </div>
          ))}
        </div>
      )}
      {postResults.length > 0 && (
        <div>
          <h2>검색결과</h2>
          {postResults.map((result, index) => (
            <div key={index} style={resultStyle}>
              <p><strong>Content:</strong> {result.title}</p>
              <p><strong>Description:</strong> {result.description}</p>
              <p><strong>Tags:</strong> {result.tags}</p>
              <p><strong>Author:</strong> {result.author}</p>
              {result.date && <p><strong>Posted at:</strong> {new Date(result.date).toLocaleString()}</p>}
              {result.image && <p><strong>Image:</strong></p>}
              {result.image && <img src={`https://192.168.6.45:3001/uploads/${result.image}`} alt={result.title} style={{ maxWidth: '100%', borderRadius: '8px' }} />}
            </div>
          ))}
        </div>
      )}
      {userResults.length === 0 && postResults.length === 0 && (
        <div>No results found</div>
      )}
    </div>
  );
};

export default SearchContent;

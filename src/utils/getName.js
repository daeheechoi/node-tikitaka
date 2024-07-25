// src/utils/getName.js

export const getName = async () => {
  try {
    const response = await fetch('/authcheck', { credentials: 'include' });
    const data = await response.json();
    if (data.isLogin === "True") {
      return { isLogin: true, userName: data.userName };
    } else {
      return { isLogin: false, userName: '' };
    }
  } catch (error) {
    console.error('Failed to fetch user name:', error);
    return { isLogin: false, userName: '' };
  }
};

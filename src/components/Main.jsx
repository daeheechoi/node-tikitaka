import React from 'react';
import HomeContent from '../MainContent/HomeContent';
import SearchContent from '../MainContent/SearchContent';
import MessageContent from '../MainContent/MessageContent';
import FollowContent from '../MainContent/FollowContent';
import CommunityContent from '../MainContent/CommunityContent';
import DiaryContent from '../MainContent/DiaryContent';
import Writing from '../MainContent/Writing';
import Profile from '../MainContent/Profile';
import VideoUpload from '../MainContent/VideoUpload';
import FileUpload from '../MainContent/FileUpload';
import CustomerSupport from '../MainContent/CustomerSupport';
import Notices from '../MainContent/Notices';
import Games from '../MainContent/Games';
import Roulette from '../MainContent/Roulette';

const Main = ({ activeLink, userName }) => {
  const contentMap = {
    'Home': <HomeContent userName={userName} />,
    'Search': <SearchContent />,
    'Message': <MessageContent userName={userName} />,
    'Follow': <FollowContent />,
    'Community': <CommunityContent />,
    'Diary': <DiaryContent />,
    'Writing': <Writing userName={userName} />,
    'Profile': <Profile userName={userName} />,
    'VideoUpload': <VideoUpload userName={userName} />,
    'FileUpload': <FileUpload userName={userName} />,
    'CustomerSupport': <CustomerSupport />,
    'Notices': <Notices />,
    'Games': <Games />,
    'Roulette': <Roulette />
  };

  return (
    <div className="main-content">
      {contentMap[activeLink] || <HomeContent userName={userName} />}
    </div>
  );
};

export default Main;

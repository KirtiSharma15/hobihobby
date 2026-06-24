import React from 'react';
import CoachChat from '../components/coach/CoachChat';

const CoachPage: React.FC = () => {
  return (
    <div className="h-screen flex flex-col">
      <CoachChat />
    </div>
  );
};

export default CoachPage;
/**
 * App Router - Phase 1: Discovery-First MVP
 * 
 * No authentication required. Simple routes for hobby discovery.
 * Learning paths and lessons disabled for Phase 1.
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { HobbyDetailPage } from './pages/HobbyDetailPage';

// Phase 1: No auth required, no learning paths yet
// import { LoginPage } from './pages/LoginPage';
// import { RegisterPage } from './pages/RegisterPage';
// import { ProfilePage } from './pages/ProfilePage';
// import { LearningPathPage } from './pages/LearningPathPage';
// import { LessonPage } from './pages/LessonPage';

const App: React.FC = () => {
  return (
    <Routes>
      {/* Phase 1: All routes accessible without auth */}
      <Route
        path="/*"
        element={
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/hobby/:id" element={<HobbyDetailPage />} />
              {/* Phase 2+ routes (disabled for Phase 1):
              <Route path="/hobby/:hobbyId/learn" element={<LearningPathPage />} />
              <Route path="/hobby/:hobbyId/learn/:moduleId/:lessonId" element={<LessonPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              */}
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
};

export default App;


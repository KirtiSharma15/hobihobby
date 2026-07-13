import React from 'react';
import { Provider } from 'react-redux';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { store, type RootState } from './store';
import { useAuth } from './hooks/useAuth';
import { useAppSelector } from './hooks/useAppDispatch';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { HobbyDetailPage } from './pages/HobbyDetailPage';
import { JourneyPage } from './pages/JourneyPage';
import { MapPage } from './pages/MapPage';
import { CommunityPage } from './pages/CommunityPage';
import { LearningPathPage } from './pages/LearningPathPage';
import { LessonPage } from './pages/LessonPage';
import QuizPage from './pages/QuizPage';
import QuizResultsPage from './pages/QuizResultsPage';
import CoachPage from './pages/CoachPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = useAppSelector(
    (state: RootState) => state.user.isAuthenticated
  );
  const isLoading = useAppSelector((state: RootState) => state.user.isLoading);
  const authChecked = useAppSelector((state: RootState) => state.user.authChecked);

  // Wait for Firebase to report the initial auth state before deciding to
  // redirect — otherwise the pre-check default (unauthenticated) briefly
  // bounces logged-in users to /login before the real state resolves.
  if (!authChecked || isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#C4522A] border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/hobby/:id" element={<HobbyDetailPage />} />
              <Route
                path="/hobby/:hobbyId/journey"
                element={
                  <ProtectedRoute>
                    <JourneyPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/map" element={<MapPage />} />
              <Route path="/hobby/:hobbyId/map" element={<MapPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/hobby/:hobbyId/learn" element={<LearningPathPage />} />
              <Route
                path="/hobby/:hobbyId/learn/:moduleId/:lessonId"
                element={<LessonPage />}
              />
              <Route path="/quiz" element={<QuizPage />} />
              <Route
                path="/quiz/results"
                element={
                  <ProtectedRoute>
                    <QuizResultsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/coach"
                element={
                  <ProtectedRoute>
                    <CoachPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  );
};

export default App;

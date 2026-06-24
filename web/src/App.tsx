import React from 'react';
import { Provider } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import { store, type RootState } from './store';
import { useAuth } from './hooks/useAuth';
import { useAppSelector } from './hooks/useAppDispatch';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { HobbyDetailPage } from './pages/HobbyDetailPage';
import { LearningPathPage } from './pages/LearningPathPage';
import { LessonPage } from './pages/LessonPage';
import QuizPage from './pages/QuizPage';
import QuizResultsPage from './pages/QuizResultsPage';
import CoachPage from './pages/CoachPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAppSelector(
    (state: RootState) => state.user.isAuthenticated
  );

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
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

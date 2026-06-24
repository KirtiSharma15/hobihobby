import React from 'react';
import { useAppSelector } from '../hooks/useAppDispatch';
import { useSaveHobby } from '../hooks/useSaveHobby';
import { useNavigate } from 'react-router-dom';

const ScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  const color =
    score >= 90 ? 'bg-green-100 text-green-700' :
    score >= 75 ? 'bg-blue-100 text-blue-700' :
    'bg-gray-100 text-gray-600';

  return (
    <span className={`text-xs font-bold px-2 py-1 rounded-full ${color}`}>
      {score}% match
    </span>
  );
};

const RecommendationCard: React.FC<{ rec: any; index: number }> = ({ rec, index }) => {
  const { isSaved, toggleSave } = useSaveHobby(rec.hobby.toLowerCase().replace(/\s+/g, '-'));
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-xs text-gray-400 font-medium">#{index + 1} match</span>
          <h3 className="text-lg font-bold text-gray-800">{rec.hobby}</h3>
          <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
            {rec.category}
          </span>
        </div>
        <ScoreBadge score={rec.matchScore} />
      </div>

      <p className="text-sm text-gray-600 mb-4">{rec.reasoning}</p>

      <div className="flex gap-4 text-xs text-gray-500 mb-4">
        <span>⏱ {rec.timeCommitment}</span>
        <span>💰 {rec.estimatedCost}</span>
        <span>📈 {rec.difficulty}</span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={toggleSave}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
            isSaved
              ? 'bg-purple-600 text-white'
              : 'border-2 border-purple-500 text-purple-600 hover:bg-purple-50'
          }`}
        >
          {isSaved ? '❤️ Saved' : '+ Save Hobby'}
        </button>
        <button
          onClick={() => navigate(`/hobbies/${rec.hobby.toLowerCase().replace(/\s+/g, '-')}`)}
          className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors"
        >
          Explore →
        </button>
      </div>
    </div>
  );
};

const QuizResultsPage: React.FC = () => {
  const recommendations = useAppSelector((state) => state.ai.recommendations);
  const navigate = useNavigate();

  if (recommendations.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No recommendations yet.</p>
          <button
            onClick={() => navigate('/quiz')}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold"
          >
            Take the Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 px-4 py-8">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Your Hobby Matches 🎯</h1>
          <p className="text-gray-500 mt-1">Based on your answers, here are your top picks</p>
        </div>

        <div className="flex flex-col gap-4">
          {recommendations.map((rec, index) => (
            <RecommendationCard key={rec.hobby} rec={rec} index={index} />
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => navigate('/quiz')}
            className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-medium"
          >
            Retake Quiz
          </button>
          <button
            onClick={() => navigate('/coach')}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold"
          >
            Ask HobiCoach
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResultsPage;
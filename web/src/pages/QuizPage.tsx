import React from 'react';
import { useHobbyQuiz } from '../hooks/useHobbyQuiz';

const QuizPage: React.FC = () => {
  const {
    currentQuestion,
    currentAnswer,
    currentStep,
    isLastStep,
    progress,
    isLoading,
    selectAnswer,
    goNext,
    goBack,
    submitQuiz,
  } = useHobbyQuiz();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1.5 bg-gray-200">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          {/* Step indicator */}
          <p className="text-center text-sm text-gray-400 mb-2">
            Question {currentStep + 1} of 7
          </p>

          {/* Question */}
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
            {currentQuestion.question}
          </h2>

          {/* Options */}
          <div className="flex flex-col gap-3">
            {currentQuestion.options.map((option) => (
              <button
                key={option}
                onClick={() => selectAnswer(option)}
                className={`w-full py-4 px-6 rounded-2xl text-left font-medium transition-all border-2 ${
                  currentAnswer === option
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {currentStep > 0 && (
              <button
                onClick={goBack}
                className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            )}
            {isLastStep ? (
              <button
                onClick={submitQuiz}
                disabled={!currentAnswer || isLoading}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                {isLoading ? 'Finding your hobbies...' : 'See My Matches 🎯'}
              </button>
            ) : (
              <button
                onClick={goNext}
                disabled={!currentAnswer}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
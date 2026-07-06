import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ChevronLeft, Check } from 'lucide-react';
import { cn } from '../utils/cn';
import { useHobbyQuiz } from '../hooks/useHobbyQuiz';

const LOADING_HOBBIES = [
  { name: 'Photography', dot: 'bg-terracotta' },
  { name: 'Pottery', dot: 'bg-olive' },
  { name: 'Watercolour', dot: 'bg-amber-500' },
];

const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const [hasStarted, setHasStarted] = useState(false);

  const {
    questions,
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

  // STATE 3: Loading - takes over regardless of intro/question state
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 font-jakarta">
        <div className="relative mx-auto mb-8 flex h-32 w-32 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-terracotta/15" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-terracotta" />
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-terracotta shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
        </div>

        <h2 className="text-center text-2xl font-bold text-ink">Finding your perfect hobbies&hellip;</h2>

        <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
          {LOADING_HOBBIES.map((hobby, index) => (
            <div
              key={hobby.name}
              className="flex translate-y-1 items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 opacity-0 animate-fadeIn"
              style={{ animationDelay: `${index * 800}ms` }}
            >
              <span className={cn('h-2 w-2 shrink-0 rounded-full', hobby.dot)} />
              <span className="text-sm font-medium text-ink">{hobby.name}&hellip;</span>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-taupe">Analysing your answers</p>
      </div>
    );
  }

  // STATE 1: Intro
  if (!hasStarted) {
    return (
      <div className="flex min-h-screen flex-col bg-cream px-6 py-6 font-jakarta">
        <div className="mx-auto flex w-full max-w-sm items-center justify-between text-sm">
          <span className="font-medium text-taupe">0 of {questions.length}</span>
          <button
            type="button"
            onClick={() => navigate('/explore')}
            className="font-medium text-taupe transition-colors hover:text-ink"
          >
            Skip
          </button>
        </div>
        <div className="mx-auto mt-3 flex w-full max-w-sm gap-1">
          {questions.map((q) => (
            <span key={q.id} className="h-1 flex-1 rounded-full bg-border" />
          ))}
        </div>

        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="relative mx-auto mb-8 flex h-56 w-56 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-terracotta/10" />
            <div className="absolute inset-6 rounded-full border-2 border-dashed border-terracotta/20" />
            <span className="absolute left-4 top-10 h-3 w-3 rounded-full bg-olive" />
            <span className="absolute bottom-9 left-7 h-2.5 w-2.5 rounded-full bg-terracotta" />
            <span className="absolute bottom-11 right-8 h-2.5 w-2.5 rounded-full bg-amber-500" />
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-terracotta shadow-lg">
              <Sparkles className="h-12 w-12 text-white" />
            </div>
          </div>

          <h1 className="max-w-xs text-3xl font-bold text-ink">Find your perfect hobby</h1>
          <p className="mt-3 max-w-xs text-sm text-taupe">
            {questions.length} quick questions · Takes 2 minutes.
            <br />
            Our AI matches you to what you&apos;ll love.
          </p>

          <button
            type="button"
            onClick={() => setHasStarted(true)}
            className="mt-8 w-full max-w-sm rounded-2xl bg-terracotta py-4 text-center font-semibold text-white shadow-sm transition-colors hover:bg-terracotta-dark"
          >
            Let&apos;s go →
          </button>
          <button
            type="button"
            onClick={() => navigate('/explore')}
            className="mt-4 text-sm font-medium text-taupe transition-colors hover:text-ink"
          >
            Skip for now
          </button>
        </div>
      </div>
    );
  }

  // STATE 2: Question
  return (
    <div className="flex min-h-screen flex-col bg-cream font-jakarta">
      {/* Progress bar */}
      <div className="h-1.5 w-full bg-border">
        <div
          className="h-full bg-terracotta transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex flex-1 flex-col px-6 py-8 md:items-center md:py-16">
        <div className="mx-auto w-full max-w-sm md:max-w-lg md:mt-0">
          <div className="md:rounded-3xl md:border md:border-border md:bg-surface md:p-8 md:shadow-sm">
            {/* Back - mobile only, floats above the question */}
            {currentStep > 0 && (
              <button
                type="button"
                onClick={goBack}
                aria-label="Go back"
                className="mb-6 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-ink transition-colors hover:bg-border/50 md:hidden"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}

            <p className="text-xs font-bold uppercase tracking-wide text-terracotta text-left md:text-center">
              Question {currentStep + 1} of {questions.length}
            </p>
            <h1 className="mt-2 text-2xl font-bold leading-snug text-ink text-left md:mt-3 md:text-center md:text-3xl">
              {currentQuestion.question}
            </h1>

            {/* Options */}
            <div className="mt-6 flex flex-col gap-3 md:mt-8">
              {currentQuestion.options.map((option) => {
                const isSelected = currentAnswer === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => selectAnswer(option)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-2xl border-2 px-5 py-4 text-left font-medium transition-colors',
                      isSelected
                        ? 'border-terracotta bg-terracotta/5 text-ink'
                        : 'border-border bg-surface text-ink hover:border-terracotta/50'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                        isSelected ? 'border-terracotta bg-terracotta' : 'border-border bg-transparent'
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="mt-8 flex gap-3">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={goBack}
                  className="hidden flex-1 items-center justify-center rounded-2xl border-2 border-border bg-surface py-4 text-center font-semibold text-ink transition-colors hover:bg-border/30 md:flex"
                >
                  Back
                </button>
              )}
              {isLastStep ? (
                <button
                  type="button"
                  onClick={submitQuiz}
                  disabled={!currentAnswer || isLoading}
                  className="flex-1 rounded-2xl bg-terracotta py-4 text-center font-semibold text-white shadow-sm transition-colors hover:bg-terracotta-dark disabled:opacity-40"
                >
                  See My Matches 🎯
                </button>
              ) : (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!currentAnswer}
                  className="flex-1 rounded-2xl bg-terracotta py-4 text-center font-semibold text-white shadow-sm transition-colors hover:bg-terracotta-dark disabled:opacity-40"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;

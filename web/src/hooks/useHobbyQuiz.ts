import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAppDispatch, useAppSelector } from './useAppDispatch';
import {
    setQuizAnswer,
    setRecommendations,
    setQuizLoading,
    setError,
    clearQuiz,
    HobbyRecommendation,
} from '../store/slices/aiSlice';
import { useNavigate } from 'react-router-dom';

const questions = [
    {
        id: 'timeStyle',
        question: 'How do you like to spend your free time?',
        options: ['Indoors', 'Outdoors', 'Both'],
    },
    {
        id: 'socialStyle',
        question: 'Do you prefer solo or social activities?',
        options: ['Solo', 'With others', 'Mix of both'],
    },
    {
        id: 'timeAvailable',
        question: "What's your weekly time budget?",
        options: ['Less than 2 hrs', '2–5 hrs', '5+ hrs'],
    },
    {
        id: 'budget',
        question: "What's your starter budget?",
        options: ['Under $50', '$50–$200', '$200+'],
    },
    {
        id: 'goal',
        question: 'What do you want from a hobby?',
        options: ['Relaxation', 'Creativity', 'Fitness', 'Learning', 'Social connection'],
    },
    {
        id: 'activityType',
        question: 'Do you prefer physical or mental activities?',
        options: ['Physical', 'Mental', 'Both'],
    },
    {
        id: 'interests',
        question: 'Any areas that interest you?',
        options: ['Art & Design', 'Music', 'Tech', 'Nature', 'Food', 'Sport', 'Writing'],
    },
];

export const useHobbyQuiz = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const quizAnswers = useAppSelector((state) => state.ai.quizAnswers);
    const isLoading = useAppSelector((state) => state.ai.isQuizLoading);
    const [currentStep, setCurrentStep] = useState(0);

    const selectAnswer = (answer: string) => {
        dispatch(setQuizAnswer({ question: questions[currentStep].id, answer }));
    };

    const goNext = () => {
        if (currentStep < questions.length - 1) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const goBack = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const submitQuiz = async () => {
        dispatch(setQuizLoading(true));
        dispatch(setError(null));
        try {
            const functions = getFunctions();
            const hobbyQuizFn = httpsCallable
                <{ quizAnswers: Record<string, string> },
                    { recommendations: HobbyRecommendation[] }
                >(functions, 'hobbyQuiz');

            const result = await hobbyQuizFn({ quizAnswers });
            dispatch(setRecommendations(result.data.recommendations));
            navigate('/quiz/results');
        } catch (err) {
            dispatch(setError('Failed to get recommendations. Please try again.'));
        } finally {
            dispatch(setQuizLoading(false));
        }
    };

    const resetQuiz = () => {
        dispatch(clearQuiz());
        setCurrentStep(0);
    };

    const currentQuestion = questions[currentStep];
    const currentAnswer = quizAnswers[currentQuestion?.id];
    const isLastStep = currentStep === questions.length - 1;
    const progress = ((currentStep + 1) / questions.length) * 100;

    return {
        questions,
        currentStep,
        currentQuestion,
        currentAnswer,
        isLastStep,
        progress,
        isLoading,
        quizAnswers,
        selectAnswer,
        goNext,
        goBack,
        submitQuiz,
        resetQuiz,
    };
};
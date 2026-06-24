import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface HobbyRecommendation {
  hobby: string;
  matchScore: number;
  reasoning: string;
  timeCommitment: string;
  estimatedCost: string;
  difficulty: string;
  category: string;
}

interface AIState {
  chatHistory: Message[];
  recommendations: HobbyRecommendation[];
  quizAnswers: Record<string, string>;
  isCoachLoading: boolean;
  isQuizLoading: boolean;
  error: string | null;
}

const initialState: AIState = {
  chatHistory: [],
  recommendations: [],
  quizAnswers: {},
  isCoachLoading: false,
  isQuizLoading: false,
  error: null,
};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.chatHistory.push(action.payload);
    },
    setRecommendations: (state, action: PayloadAction<HobbyRecommendation[]>) => {
      state.recommendations = action.payload;
    },
    setQuizAnswer: (state, action: PayloadAction<{ question: string; answer: string }>) => {
      state.quizAnswers[action.payload.question] = action.payload.answer;
    },
    clearQuiz: (state) => {
      state.quizAnswers = {};
      state.recommendations = [];
    },
    clearChat: (state) => {
      state.chatHistory = [];
    },
    setCoachLoading: (state, action: PayloadAction<boolean>) => {
      state.isCoachLoading = action.payload;
    },
    setQuizLoading: (state, action: PayloadAction<boolean>) => {
      state.isQuizLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  addMessage,
  setRecommendations,
  setQuizAnswer,
  clearQuiz,
  clearChat,
  setCoachLoading,
  setQuizLoading,
  setError,
} = aiSlice.actions;

export const aiReducer = aiSlice.reducer;
export default aiReducer;
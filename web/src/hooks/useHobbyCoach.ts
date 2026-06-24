import { useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../services/firebase';
import { useAppDispatch, useAppSelector } from './useAppDispatch';
import {
    addMessage,
    setCoachLoading,
    setError,
    Message,
} from '../store/slices/aiSlice';

export const useHobbyCoach = (hobbyContext?: string) => {
    const dispatch = useAppDispatch();
    const chatHistory = useAppSelector((state) => state.ai.chatHistory);
    const isLoading = useAppSelector((state) => state.ai.isCoachLoading);

    const sendMessage = useCallback(
        async (content: string) => {
            if (!content.trim()) return;

            // Add user message immediately
            const userMessage: Message = {
                id: `user_${Date.now()}`,
                role: 'user',
                content: content.trim(),
                timestamp: Date.now(),
            };
            dispatch(addMessage(userMessage));
            dispatch(setCoachLoading(true));
            dispatch(setError(null));

            try {
                const hobbyCoachFn = httpsCallable
                    <{ messages: Message[]; hobbyContext?: string },
                        { reply: string }
                    >(functions, 'hobbyCoach');

                const result = await hobbyCoachFn({
                    messages: [...chatHistory, userMessage],
                    hobbyContext,
                });

                const assistantMessage: Message = {
                    id: `assistant_${Date.now()}`,
                    role: 'assistant',
                    content: result.data.reply,
                    timestamp: Date.now(),
                };
                dispatch(addMessage(assistantMessage));
            } catch (err) {
                dispatch(setError('Coach is unavailable right now. Please try again.'));
            } finally {
                dispatch(setCoachLoading(false));
            }
        },
        [chatHistory, dispatch, hobbyContext]
    );

    return { chatHistory, isLoading, sendMessage };
};
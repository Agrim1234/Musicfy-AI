"use client"

import { configureStore } from '@reduxjs/toolkit'
import audioResponsesReducer from '@/app/features/audioResponses/audioResponse'
import currentIndexReducer from '@/app/features/audioResponses/currentIndex'
import videoResponsesReducer from '../features/videoResponses/videoResponse'
import audioFilesToBeEditedReducer from '../features/audioFilesToBeEdited/audioFilesToBeEdited'

// Define the initial state



const store = configureStore({
    reducer: {
       audioResponses: audioResponsesReducer,
       currentIndex: currentIndexReducer,
       videoResponses: videoResponsesReducer, 
       audioFilesToBeEdited: audioFilesToBeEditedReducer
    },
})


// Infer the type of `store`
export type AppStore = typeof store
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

export default store;


"use client"

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../../store/store';

const initialState: number = 0

// Create the slice and pass in the initial state
const currentIndexSlice = createSlice({
    name: 'currentIndex',
    initialState,
    reducers: {
        currentIndexUpdated: (state, action: PayloadAction<number>) => action.payload,
    }
})


// Export the auto-generated action creator with the same name
export const { currentIndexUpdated } = currentIndexSlice.actions

export const selectPostById = (state: RootState, id: string) =>
    state.audioResponses.find(audioResponseItem => audioResponseItem.id === id)


// Export the generated reducer function
export default currentIndexSlice.reducer
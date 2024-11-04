"use client"

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { audioResponse } from '../../generatemusic/page'
import { v4 as uuidv4 } from 'uuid';
import { RootState } from '../../store/store';

enum fileStatus {
    notLoading,
    loading,
    loaded,
    generateRequest,
}

type audioFilesToBeEditedProps = {
    name: string,
    data: ArrayBuffer
}

const initialState: File[] = []

// Create the slice and pass in the initial state
const audioFilesToBeEditedSlice = createSlice({
    name: 'audioFilesToBeEdited',
    initialState,
    reducers: {
        audioFileAdded(state, action: PayloadAction<File>) {
            // "Mutate" the existing state array, which is
            // safe to do here because `createSlice` uses Immer inside.
            state.push(action.payload)
        },
        audioFileRemoved(state, action: PayloadAction<File>) {
            state.filter(audioFile => audioFile !== action.payload)
        }   
    }
})


// Export the auto-generated action creator with the same name
export const { audioFileAdded, audioFileRemoved } = audioFilesToBeEditedSlice.actions

export const selectPostById = (state: RootState, id: string) =>
    state.audioResponses.find(audioResponseItem => audioResponseItem.id === id)


// Export the generated reducer function
export default audioFilesToBeEditedSlice.reducer
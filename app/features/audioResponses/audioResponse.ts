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

const initialState: audioResponse[] = [

]

// Create the slice and pass in the initial state
const audioResponsesSlice = createSlice({
    name: 'audioResponses',
    initialState,
    reducers: {
        audioResponseAdded(state, action: PayloadAction<audioResponse>) {
            // "Mutate" the existing state array, which is
            // safe to do here because `createSlice` uses Immer inside.
            state.push(action.payload)
        },
        audioResponseUpdated(state, action: PayloadAction<audioResponse>) {
            const { id, song, value, mediaFileStatus } = action.payload
            const existingAudioResponse = state.find(post => post.id === id)
            if (existingAudioResponse) {
                existingAudioResponse.song = song
                existingAudioResponse.value = value
                existingAudioResponse.mediaFileStatus = mediaFileStatus
            }
        }
    }
})


// Export the auto-generated action creator with the same name
export const { audioResponseAdded, audioResponseUpdated } = audioResponsesSlice.actions

export const selectPostById = (state: RootState, id: string) =>
    state.audioResponses.find(audioResponseItem => audioResponseItem.id === id)


// Export the generated reducer function
export default audioResponsesSlice.reducer
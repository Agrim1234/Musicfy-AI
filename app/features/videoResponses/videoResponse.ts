"use client"

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { videoResponse } from '../../page';
import { v4 as uuidv4 } from 'uuid';
import { RootState } from '../../store/store';

const initialState: videoResponse[] = []

enum fileStatus {
    notLoading,
    loading,
    loaded,
    generateRequest,
}

// Create the slice and pass in the initial state
const videoResponsesSlice = createSlice({
    name: 'videoResponses',
    initialState,
    reducers: {
        videoResponseAdded(state, action: PayloadAction<videoResponse>) {
            // "Mutate" the existing state array, which is
            // safe to do here because `createSlice` uses Immer inside.
            state.push(action.payload)
        },
        videoResponseUpdated(state, action: PayloadAction<videoResponse>) {
            const { id, videoComedyShow, value, mediaFileStatus } = action.payload
            const existingVideoResponse = state.find(post => post.id === id)
            if (existingVideoResponse) {
                existingVideoResponse.videoComedyShow = videoComedyShow
                existingVideoResponse.value = value
                existingVideoResponse.mediaFileStatus = mediaFileStatus
            }
        }
    }
})


// Export the auto-generated action creator with the same name
export const { videoResponseAdded, videoResponseUpdated } = videoResponsesSlice.actions

export const selectPostById = (state: RootState, id: string) =>
    state.videoResponses.find(videoResponseItem => videoResponseItem.id === id)


// Export the generated reducer function
export default videoResponsesSlice.reducer
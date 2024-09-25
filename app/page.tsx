"use client"

import Head from "next/head";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import ReactPlayer from 'react-player'
import { useSession } from "next-auth/react";
import { fetchuser, updateProfile } from "@/actions/useractions";
import { audioResponse } from "./generatemusic/page";
import { useAppDispatch, useAppSelector } from "./hooks";
import axios, { isCancel, AxiosError } from 'axios';
import { videoResponseAdded, videoResponseUpdated } from "./features/videoResponses/videoResponse";
import Page from "./generatemusic/page";

export type videoResponse = {
    userPrompt: string;
    value: string | undefined,
    type: string | undefined,
    id: string,
    mediaFileStatus: fileStatus | undefined,
    videoComedyShow: comedyShowVideo,
    isPlaying: boolean
}

enum fileStatus {
    notLoading,
    loading,
    loaded,
    generateRequest,
}

export type ObjectUser = {
    DataComedyShow: Array<videoResponse> | undefined,
    DataCustomMusic: Array<audioResponse> | undefined,
    email: string,
    username: string,
}

export type objectPromptResponse = {
    userPrompt: string,
    value: string | undefined,
    type: string | undefined,
    mediaFileStatus: fileStatus | undefined,
    mediaUrl: string | undefined,
}

export default function Home() {

    const [responses, setResponses] = useState<Array<videoResponse>>([])
    const videoResponses = useAppSelector(state => state.videoResponses)
    const dispatch = useAppDispatch();
    const { data: session } = useSession()
    const [prompt, setPrompt] = useState<string>('')
    const [currentUser, setCurrentUser] = useState<ObjectUser>({ DataCustomMusic: [], DataComedyShow: [], email: '', username: '' })//+

    const getData = async () => {
        let u = await fetchuser(session?.user?.email)
        setCurrentUser(u)
    }

    const updateUserData = async (userData: any) => {
        await updateProfile(userData)
        console.log('update data', userData)
    }

    useEffect(() => {
        if (currentUser && currentUser.DataComedyShow) {
            console.log(currentUser.DataComedyShow, 'current User log')
            currentUser.DataComedyShow.forEach(element => {
                dispatch(videoResponseAdded(element))
            });
            console.log(responses, currentUser.DataComedyShow);
        }
    }, [currentUser])

    useEffect(() => {
        getData();
    }, [session])

    useEffect(() => {
        if (session && session.user?.email && videoResponses.length !== 0 && videoResponses !== currentUser.DataComedyShow) {
            console.log(responses, 'responses at session')
            //setCurrentUser({ Data: responses, email: session.user?.email, username: session.user?.email.split("@")[0] })
            updateUserData({ DataCustomMusic: currentUser.DataCustomMusic, DataComedyShow: videoResponses, email: session.user?.email, username: session.user?.email.split("@")[0] })
        }
    }, [videoResponses])

    // const handleChange = (e: any) => {
    //     setPrompt(e.target.value)
    // }

    // const handleClickComedy = async () => {

    //     const elementId = uuidv4();

    //     dispatch(videoResponseAdded({
    //         userPrompt: prompt,
    //         value: '',
    //         type: 'promptResponseComedyShow',
    //         id: elementId,
    //         mediaFileStatus: fileStatus.loading,
    //         videoComedyShow: {
    //             likes: 0,
    //             name: 'User song',
    //             imageUrl: '',
    //             srcUrl: ``,
    //             duration: ''
    //         },
    //         isPlaying: false
    //     }))

    //     let response = await axios({
    //         method: 'POST',
    //         url: `${process.env.NEXT_PUBLIC_URL}/api/generate-comedy`,
    //         headers: { 'content-type': 'application/json' },
    //         data: JSON.stringify({ prompt, elementId }),
    //     })

    //     let data = response.data;
    //     //console.log(data)

    //     dispatch(videoResponseUpdated({
    //         userPrompt: prompt,
    //         value: data.value,
    //         type: 'promptResponseComedyShow',
    //         id: elementId,
    //         mediaFileStatus: fileStatus.loaded,
    //         videoComedyShow: {
    //             likes: 0,
    //             name: 'User song',
    //             imageUrl: data.imageUrl,
    //             srcUrl: data.file,
    //             duration: data.duration
    //         },
    //         isPlaying: false
    //     }))
    // }

    // const handleGenerateVideo = async (targetElementId: string) => {
    //     //console.log(target.target)
    //     let targetId = targetElementId;
    //     let targetElement = responses.find(r => r.id === targetId);
    //     let promptVideoGeneration = '';
    //     if (targetElement) {
    //         promptVideoGeneration = targetElement.value || ''
    //         setResponses(responses => responses.map(r =>
    //             r.id === targetElementId ? { ...r, mediaFileStatus: fileStatus.loading } : r
    //         ))
    //     }
    // }

    // const playVideo = (targetId: string) => {
    //     if (responses.find(r => r.id === targetId)?.videoComedyShow.srcUrl) {
    //         const video = document.getElementById(targetId);
    //         if (video) {
    //             setResponses(responses => responses.map(r =>
    //                 r.id === targetId ? { ...r, isPlaying: true } : r
    //             ))
    //         }
    //     }
    // }

    return (
        <>
            <Head>
                <link rel="icon" href="/icon.ico" sizes="any" />
            </Head>
            <div className='relative w-screen h-[90vh] flex'>

                <Page />

            </div>
        </>
    )
}



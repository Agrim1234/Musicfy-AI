"use client"

import React from 'react'
import Image from 'next/image'
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import ReactPlayer from 'react-player'
import { useSession } from "next-auth/react";
import {  ObjectUser, objectPromptResponse } from "@/app/page";
import { fetchuser, updateProfile } from "@/actions/useractions";
import AudioPlayerComponent from "@/components/AudioPlayerComponent";
import MusicCustomizationComponent, { musicChildComponentDatatype } from "@/components/MusicCustomizationComponent";
import MusicTrackCardComponent from '@/components/MusicTrackCardComponent';
import { useAppSelector } from '@/app/hooks'
import { useAppDispatch } from '@/app/hooks'
import { audioResponseAdded, audioResponseUpdated } from '@/app/features/audioResponses/audioResponse'
import { currentIndexUpdated } from '../features/audioResponses/currentIndex';


enum fileStatus {
    notLoading,
    loading,
    loaded,
    generateRequest,
}

export type audioResponse = {
    userPrompt: string;
    value: string | undefined,
    type: string | undefined,
    id: string,
    mediaFileStatus: fileStatus | undefined,
    song: Song,
    isPlaying: boolean
};

const Page = () => {

    const audioResponses = useAppSelector(state => state.audioResponses)
    const currentIndex: number  = useAppSelector(state => state.currentIndex)
    const dispatch = useAppDispatch()

    const { data: session } = useSession()
    //const [prompt, setPrompt] = useState<string>('')
    //const [videoData, setVideoData] = useState('')
    const [currentUser, setCurrentUser] = useState<ObjectUser>({ DataCustomMusic: [], DataComedyShow: [], email: '', username: '' })//+
    //const [promptResponse, setPromptResponse] = useState<objectPromptResponse>()
    //const [currentIndex, setCurrentIndex] = useState<number>()
    console.log(audioResponses)

    const getData = async () => {
        let u = await fetchuser(session?.user?.email)
        setCurrentUser(u)
    }

    const updateUserData = async (userData: any) => {
        await updateProfile(userData)
        console.log('update data', userData)
    }

    useEffect(() => {
        if (currentUser && currentUser.DataCustomMusic) {
            console.log(currentUser.DataCustomMusic, 'current User log')
            currentUser.DataCustomMusic.forEach(element => {
                if (audioResponses.find(r => r.id === element.id)) {
                    
                }else{
                    dispatch(audioResponseAdded(element))
                }
            });
            //setResponses(currentUser.DataCustomMusic);
            console.log(audioResponses, currentUser.DataCustomMusic);
        }
    }, [currentUser])

    useEffect(() => {
        getData();
    }, [session])

    useEffect(() => {
        if (session && session.user?.email && audioResponses.length !== 0 && audioResponses !== currentUser.DataCustomMusic) {
            console.log(audioResponses, 'responses at session')
            //setCurrentUser({ Data: responses, email: session.user?.email, username: session.user?.email.split("@")[0] })
            updateUserData({ DataCustomMusic: audioResponses, DataComedyShow: currentUser.DataComedyShow, email: session.user?.email, username: session.user?.email.split("@")[0] })
        }
    }, [audioResponses])

    // useEffect(() => {
    //     if (promptResponse && !responses.find(r => r.value === prompt)) {
    //         setResponses([...responses, { ...promptResponse, id: uuidv4(), isPlaying: false }])
    //     }
    //     console.log(responses)
    // }, [promptResponse])

    // const handleChange = (e: any) => {
    //     setPrompt(e.target.value)
    // }

    // const handleClickMusic = async () => {
    //     let response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/generate-music`, {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({ prompt }),
    //     })

    //     let data = await response.json();
    //     //console.log(data)
    //     setPromptResponse({ value: data, userPrompt: prompt, type: 'promptResponseMusic', mediaFileStatus: fileStatus.notLoading, mediaUrl: undefined });
    // }

    // const handleMusicCustomization = (targetId: string) => {
    //     let targetElement = responses.find(r => r.id === targetId);
    //     if (targetElement) {
    //         setResponses(responses => responses.map(r =>
    //             r.id === targetId ? { ...r, mediaFileStatus: fileStatus.generateRequest } : r
    //         ))
    //     }
    // }

    const handleGenerateMusicFile = async (musicGenerationData: musicChildComponentDatatype): Promise<void> => {
        const { id, tag, prompt, speedValue, clarityValue } = musicGenerationData
        console.log(id)
        const elementId = uuidv4()
        dispatch(audioResponseAdded({
            userPrompt: prompt,
            value: '',
            type: 'promptResponseMusic',
            id: elementId,
            mediaFileStatus: fileStatus.loading,
            song: {
                likes: 0, 
                name: 'User song', 
                imageUrl: '', 
                srcUrl: ``,
                duration: ''
            },
            isPlaying: false
        }))
        // setResponses([...responses, { value: undefined, id: elementId, isPlaying: false, userPrompt: prompt, type: 'promptResponseMusic', mediaFileStatus: fileStatus.loading, song: { imageUrl: '', srcUrl: '', likes: 0, duration: '0:0' } }])
        // let targetElement = responses.find(r => r.id === id);
        // let promptMusicGeneration: string | undefined = '';
        // if (targetElement) {
        //     promptMusicGeneration = targetElement.value
        //     setResponses(responses => responses.map(r =>
        //         r.id === id ? { ...r, mediaFileStatus: fileStatus.loading } : r
        //     ))
        // }
        //console.log(promptMusicGeneration)

        let response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/generate-music-file`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ elementId, tag, speedValue, clarityValue, prompt }),
        })

        let data = await response.json();
        console.log(data.file, data.error, data.value, data.duration, data.imageUrl,);

        if (data.file) {
            //setResponses(responses => responses.map(r => {console.log(r.id); return r;}));
            // setResponses(responses => responses.map(r =>
            //     r.id === elementId ? { ...r, song: { duration: data.duration, likes: 0, name:'User song', imageUrl: data.imageUrl, srcUrl: `/${data.file}` }, value: data.value, mediaFileStatus: fileStatus.loaded } : r
            // ))
            dispatch(audioResponseUpdated({
                userPrompt: prompt,
                value: data.value,
                type: 'promptResponseMusic',
                id: elementId,
                mediaFileStatus: fileStatus.loaded,
                song: { duration: data.duration, likes: 0, tags: [tag], name:'User song', imageUrl: data.imageUrl, srcUrl: `/${data.file}` },
                isPlaying: false
            }))
        }

    }

    const handleChildData = (musicGenerationData: any) => {
        console.log('Selected tag:', musicGenerationData);
        // You can perform any action here with the selected tag.
        handleGenerateMusicFile(musicGenerationData)
    };

    const handleMusicCardClick = (targetId: string) => {
        const audioElement = audioResponses.find(r => r.id === targetId);
        if (audioElement) {
            dispatch(currentIndexUpdated(audioResponses.indexOf(audioElement)))
        }
    }

    return (
        <>
            <div className='relative w-screen h-[90vh] flex'>

                <MusicCustomizationComponent childData={handleChildData} />

                {audioResponses.length === 0 && <div className='w-2/6 h-[70vh] z-0 flex  justify-center items-center'>
                    <div className='main flex flex-col items-center'>
                        <Image src={'/mainScreenLogo.png'} alt={"main image"} width={150} height={200} className='z-0' />
                        <h1 className='text-4xl text-center'>Welcome to AI Music generator</h1>
                        <p className='text-xl text-center'>Let&apos;s create something truly mind blowing</p>
                    </div>
                </div>}

                {audioResponses.length !== 0 && <div className='main h-[80vh] z-0 overflow-auto scroll-smooth bg-slate-300 w-2/6 m-md rounded-lg'>
                    {audioResponses.map((item) => {
                        return <div key={item.id} className='flex flex-col z-0'>
                            <div className="mx-lg my-sm bg-slate-400 p-md shadow-2xl rounded-lg flex flex-col z-0 gap-4">
                                {/* <p>{item.value}</p> */}
                                {
                                    item.mediaFileStatus === fileStatus.loading && (item.type === 'promptResponseMusic') && <div><Image src="/loading.gif" alt="loading for slow net" width={68} height={150} className='bg-transparent invert z-0' /></div>
                                }

                                {item.type === 'promptResponseMusic' && item.mediaFileStatus === fileStatus.loaded && <div className='flex z-0 flex-col gap-4' onClick={() => handleMusicCardClick(item.id)}>
                                    {
                                        item.song.srcUrl && <MusicTrackCardComponent song={item.song}  />
                                    }
                                </div>}
                            </div>
                        </div>
                    })}
                </div>}

                <div className='footer w-screen flex justify-center gap-4 absolute bottom-0 bg-slate-200 items-center'>
                    {
                        audioResponses.length !== 0 && currentIndex !== undefined && audioResponses[currentIndex] && audioResponses[currentIndex].mediaFileStatus === fileStatus.loaded &&
                        <AudioPlayerComponent />
                    }
                </div>
            </div>
        </>
    )
}

export default Page

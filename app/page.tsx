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

    //const audioRef = useRef(null);
    const { data: session } = useSession()
    const [prompt, setPrompt] = useState<string>('')
    //const [videoData, setVideoData] = useState('')
    const [currentUser, setCurrentUser] = useState<ObjectUser>({ DataCustomMusic: [], DataComedyShow: [], email: '', username: '' })//+
    //const [promptResponse, setPromptResponse] = useState<objectPromptResponse>()
    //const [isVideoLoaded, setIsVideoLoaded] = useState<fileStatus>(fileStatus.notLoading)
    //const [audioUrl, setAudioUrl] = useState<string>()

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
            //setResponses(currentUser.DataComedyShow);
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

    // useEffect(() => {
    //     if (promptResponse ) {
    //         setResponses([...responses, { ...promptResponse, id: uuidv4(), isPlaying: false }])
    //     }
    //     console.log(responses)
    // }, [promptResponse])

    const handleChange = (e: any) => {
        setPrompt(e.target.value)
        //console.log(prompt)
        //console.log(JSON.stringify({prompt}))
    }

    const handleClickComedy = async () => {

        const elementId = uuidv4();

        dispatch(videoResponseAdded({
            userPrompt: prompt,
            value: '',
            type: 'promptResponseComedyShow',
            id: elementId,
            mediaFileStatus: fileStatus.loading,
            videoComedyShow: {
                likes: 0,
                name: 'User song',
                imageUrl: '',
                srcUrl: ``,
                duration: ''
            },
            isPlaying: false
        }))

        // TODO: send prompt to the server and get response from the server
        let response = await axios({
            method: 'POST',
            url: `${process.env.NEXT_PUBLIC_URL}/api/generate-comedy`,
            headers: { 'content-type': 'application/json' },
            data: JSON.stringify({prompt, elementId}),
        })

        let data = response.data;
        //console.log(data)

        dispatch(videoResponseUpdated({
            userPrompt: prompt,
            value: data.value,
            type: 'promptResponseComedyShow',
            id: elementId,
            mediaFileStatus: fileStatus.loaded,
            videoComedyShow: {
                likes: 0,
                name: 'User song',
                imageUrl: data.imageUrl,
                srcUrl: data.file,
                duration: data.duration
            },
            isPlaying: false
        }))

        // setPromptResponse({ userPrompt: prompt, value: data, type: 'promptResponseComedyShow', mediaFileStatus: fileStatus.notLoading, mediaUrl: undefined });
    }

    const handleGenerateVideo = async (targetElementId: string) => {
        //console.log(target.target)
        let targetId = targetElementId;
        //console.log(targetId)
        let targetElement = responses.find(r => r.id === targetId);
        let promptVideoGeneration = '';
        if (targetElement) {
            promptVideoGeneration = targetElement.value || ''
            setResponses(responses => responses.map(r =>
                r.id === targetElementId ? { ...r, mediaFileStatus: fileStatus.loading } : r
            ))
        }

        // let myHeaders = new Headers();
        // myHeaders.append("Content-Type", "application/json");
        // let response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/generate-video`, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({ promptVideoGeneration }),
        // })

        // let data = await response.json();
        // let output = data.file;
        // // setTimeout(async () => {
        // //     setIsVideoLoaded(fileStatus.loading)

        // //     let responseVideoFetch = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/fetch-video`, {
        // //         method: 'POST',
        // //         headers: myHeaders,
        // //         body: JSON.stringify({ id }),
        // //         redirect: 'follow'
        // //     })

        // //     let dataFetchQueue = await responseVideoFetch.json();
        // //     while (dataFetchQueue.status === 'processing') {
        // //         let responseFetchVideoRepeat = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/fetch-video`, {
        // //             method: 'POST',
        // //             headers: myHeaders,
        // //             body: JSON.stringify({
        // //                 id
        // //             }),
        // //             redirect: 'follow'
        // //         })

        // //         dataFetchQueue = await responseFetchVideoRepeat.json();
        // //         console.log(dataFetchQueue.status)
        // //     }
        // // }, timeWait);
        // //     let dataFetchQueue = await responseFetchQueueRepeat.json();
        // // }

        // if (data.file && targetElement) {
        //     setResponses(responses => responses.map(r =>
        //         r.id === targetElementId ? { ...r, mediaUrl: data.file } : r
        //     ))
        //     console.log(targetElement.videoComedyShow);
        // }

        // if (targetElement) {
        //     setResponses(responses => responses.map(r =>
        //         r.id === targetElementId ? { ...r, mediaFileStatus: fileStatus.loaded } : r
        //     ))
        // }
        // console.log(isVideoLoaded)
    }

    const playVideo = (targetId: string) => {
        if (responses.find(r => r.id === targetId)?.videoComedyShow.srcUrl) {
            const video = document.getElementById(targetId);
            if (video) {
                setResponses(responses => responses.map(r =>
                    r.id === targetId ? { ...r, isPlaying: true } : r
                ))
            }
        }
    }

    return (
        <>
            <Head>
                <link rel="icon" href="/icon.ico" sizes="any" />
            </Head>
            <div className='relative w-screen h-[90vh] flex'>

                <div className='footer w-[50%] h-full flex flex-col justify-center gap-4 m-md rounded-xl bg-slate-200 items-center py-sm '>
                    <input type="text" className='w-[90%] h-[45px] border-2 border-black p-sm rounded-lg' value={prompt ? prompt : ''} onChange={handleChange} />
                    <button className='border-[1px] border-black p-sm rounded-lg bg-white' onClick={handleClickComedy}>Generate Comedy Show</button>
                </div>

                {videoResponses.length !== 0 ? <div className='main h-[80vh] overflow-auto w-[50%]'>
                    {videoResponses.map((item, index) => {
                        return <div key={item.id} className='flex flex-col'>
                            <div className="m-lg bg-slate-700 text-white p-md shadow-2xl rounded-lg">
                                {item.userPrompt}
                            </div>
                            <div className="mx-lg my-sm bg-slate-400 p-md shadow-2xl rounded-lg flex flex-col gap-4">
                                <p>{item.value}</p>
                                {
                                    item.mediaFileStatus === fileStatus.loading && (item.type === 'promptResponseComedyShow' || item.type === 'promptResponseMusic') && <div><Image src="/loading.gif" alt="loading for slow net" width={68} height={150} className='bg-transparent invert' /></div>
                                }

                                {item.type === 'promptResponseComedyShow' && <div>
                                    {
                                        item.videoComedyShow && <ReactPlayer width={400} height={250}
                                            controls
                                            playing={item.isPlaying}
                                            onPlay={() => playVideo(item.id)} id={item.id} url={item.videoComedyShow.srcUrl}>
                                        </ReactPlayer>
                                    }
                                </div>}

                            </div>
                        </div>
                    })}
                </div> : <div className='w-[50%] h-[80vh] flex justify-center items-center'>
                    <div className='main flex flex-col items-center'>
                        <Image src={'/mainScreenLogo.png'} alt={"main image"} width={150} height={200} />
                        <h1 className='text-4xl text-center'>Welcome to Comedy@AI</h1>
                        <p className='text-xl text-center'>AI meets comedy</p>
                    </div>
                </div>}

            </div>
        </>
    )
}



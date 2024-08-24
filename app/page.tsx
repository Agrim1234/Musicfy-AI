"use client"

import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import ReactAudioPlayer from "react-audio-player";
import ReactPlayer from 'react-player'
import { useSession } from "next-auth/react";
import { fetchuser, updateProfile } from "@/actions/useractions";

export type objectResponse = {
    value: string | undefined,
    type: string | undefined,
    id: string,
    isFileLoaded: isLoading | undefined,
    mediaUrl: string | undefined,
    isPlaying: boolean
}

enum isLoading {
    notLoading,
    loading,
    loaded,
}

export type ObjectUser = {
    Data: Array<objectResponse> | undefined,
    email: string,
    username: string,
}

export default function Home() {

    type objectPromptResponse = {
        value: string | undefined,
        type: string | undefined,
        isFileLoaded: isLoading | undefined,
        mediaUrl: string | undefined,
    }


    const { data: session } = useSession()

    const [prompt, setPrompt] = useState<string>('')
    //const [videoData, setVideoData] = useState('')

    const [currentUser, setCurrentUser] = useState<ObjectUser>({ Data: [], email: '', username: '' })//+

    const [promptResponse, setPromptResponse] = useState<objectPromptResponse>()
    const [responses, setResponses] = useState<Array<objectResponse>>([])
    const [isVideoLoaded, setIsVideoLoaded] = useState<isLoading>(isLoading.notLoading)
    const [audioUrl, setAudioUrl] = useState<string>()

    const getData = async () => {
        let u = await fetchuser(session?.user?.email)
        setCurrentUser(u)
    }

    const updateUserData = async (userData: any) => {
        await updateProfile(userData)
        console.log('update data', userData)
    }

    useEffect(() => {
        if (currentUser && currentUser.Data) {
            console.log(currentUser.Data, 'current User log')
            setResponses(currentUser.Data);
        }
    }, [currentUser])

    useEffect(() => {
        getData();
    }, [session])

    useEffect(() => {
        if (session && session.user?.email) {
            setCurrentUser({ Data: responses, email: session.user?.email, username: session.user?.email.split("@")[0] })
            updateUserData(currentUser)
        }
    }, [responses])

    useEffect(() => {
        if (promptResponse && !responses.find(r => r.value === prompt)) {
            setResponses([...responses, { value: prompt, type: 'userPrompt', id: uuidv4(), isFileLoaded: isLoading.notLoading, mediaUrl: undefined, isPlaying: false }, { ...promptResponse, id: uuidv4(), isPlaying: false }])
        }
        console.log(responses)
    }, [promptResponse])

    const handleChange = (e: any) => {
        setPrompt(e.target.value)
        //console.log(prompt)
        //console.log(JSON.stringify({prompt}))
    }

    const handleClickComedy = async () => {
        // TODO: send prompt to the server and get response from the ser    ver
        //console.log(prompt)
        let response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/generate-comedy`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt }),
        })

        let data = await response.json();
        //console.log(data)
        setPromptResponse({ value: data, type: 'promptResponseComedyShow', isFileLoaded: isLoading.notLoading, mediaUrl: undefined });
    }

    const handleClickMusic = async () => {
        let response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/generate-music`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt }),
        })

        let data = await response.json();
        //console.log(data)
        setPromptResponse({ value: data, type: 'promptResponseMusic', isFileLoaded: isLoading.notLoading, mediaUrl: undefined });
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
                r.id === targetElementId ? { ...r, isFileLoaded: isLoading.loading } : r
            ))
        }

        let myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        let response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/generate-video`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ promptVideoGeneration }),
        })

        let data = await response.json();
        let output = data.file;
        //console.log(output)
        //console.log(data.id)
        //setVideoData(data);
        //let timeWait = data.eta * 1000;

        // setTimeout(async () => {
        //     setIsVideoLoaded(isLoading.loading)

        //     let responseVideoFetch = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/fetch-video`, {
        //         method: 'POST',
        //         headers: myHeaders,
        //         body: JSON.stringify({ id }),
        //         redirect: 'follow'
        //     })

        //     let dataFetchQueue = await responseVideoFetch.json();
        //     while (dataFetchQueue.status === 'processing') {
        //         let responseFetchVideoRepeat = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/fetch-video`, {
        //             method: 'POST',
        //             headers: myHeaders,
        //             body: JSON.stringify({
        //                 id
        //             }),
        //             redirect: 'follow'
        //         })

        //         dataFetchQueue = await responseFetchVideoRepeat.json();
        //         console.log(dataFetchQueue.status)
        //     }
        // }, timeWait);
        //     let dataFetchQueue = await responseFetchQueueRepeat.json();
        // }

        if (data.file && targetElement) {
            setResponses(responses => responses.map(r =>
                r.id === targetElementId ? { ...r, mediaUrl: data.file } : r
            ))
            console.log(targetElement.mediaUrl);
        }

        if (targetElement) {
            //promptMusicGeneration = targetElement.value
            setResponses(responses => responses.map(r =>
                r.id === targetElementId ? { ...r, isFileLoaded: isLoading.loaded } : r
            ))
        }

        console.log(isVideoLoaded)
    }

    const handleGenerateMusicFile = async (id: string): Promise<void> => {
        let targetElement = responses.find(r => r.id === id);
        let promptMusicGeneration: string | undefined = '';
        if (targetElement) {
            promptMusicGeneration = targetElement.value
            setResponses(responses => responses.map(r =>
                r.id === id ? { ...r, isFileLoaded: isLoading.loading } : r
            ))
        }

        //console.log(promptMusicGeneration)

        let response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/generate-music-file`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ promptMusicGeneration }),
        })

        let data = await response.json();
        //console.log(data.file, data.error);
        //setAudioUrl(data.file);

        if (data.file && targetElement) {
            setResponses(responses => responses.map(r =>
                r.id === id ? { ...r, mediaUrl: data.file } : r
            ))
            console.log(targetElement.mediaUrl);
        }

        if (targetElement) {
            //promptMusicGeneration = targetElement.value
            setResponses(responses => responses.map(r =>
                r.id === id ? { ...r, isFileLoaded: isLoading.loaded } : r
            ))
        }
    }

    const playSong = (targetId: string) => {
        if (responses.find(r => r.id === targetId)?.mediaUrl) {
            const audio = new Audio(responses.find(r => r.id === targetId)?.mediaUrl);
            if (!audio.play()) {
                audio.play();
            }
        }
    }

    const playVideo = (targetId: string) => {
        if (responses.find(r => r.id === targetId)?.mediaUrl) {
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
            <div className='relative w-screen h-[90vh]'>

                {responses.length === 0 && <div className='w-full h-[80vh] flex justify-center items-center'>
                    <div className='main flex flex-col'>
                        <h1 className='text-4xl text-center'>Welcome to Comedy@AI</h1>
                        <p className='text-xl text-center'>AI meets comedy</p>
                    </div>
                </div>}

                {responses.length !== 0 && <div className='main h-[80vh] overflow-auto w-full '>
                    {responses.map((item) => {
                        return <div key={item.id} className={`${item.type === 'userPrompt' ? "m-lg bg-slate-700 text-white p-md shadow-2xl rounded-lg" : "m-lg bg-slate-400 p-md shadow-2xl rounded-lg flex flex-col gap-3"}`}>
                            <p>{item.value}</p>
                            {item.isFileLoaded === isLoading.loading && (item.type === 'promptResponseComedyShow' || item.type === 'promptResponseMusic') && <div><Image src="/loading.gif" alt="loading for slow net" width={68} height={150} className='bg-transparent invert' /></div>}
                            {item.type === 'promptResponseComedyShow' && <div>
                                {item.mediaUrl && <ReactPlayer width={400} height={250}
                                    controls
                                    playing={item.isPlaying}
                                    onPlay={() => playVideo(item.id)} id={item.id} url={item.mediaUrl}>
                                </ReactPlayer>}
                                <button className='bg-black text-white rounded-lg p-sm m-sm' id={item.id} onClick={() => handleGenerateVideo(item.id)}> Generate Video</button>
                                <button onClick={() => playVideo(item.id)} disabled={!item.mediaUrl} className="bg-black text-white rounded-lg p-sm m-sm disabled:bg-slate-500">Play Video</button>
                            </div>}
                            {item.type === 'promptResponseMusic' && <div>
                                {item.mediaUrl && <ReactAudioPlayer
                                    src={item.mediaUrl}
                                    controls
                                    className="m-md"
                                    onPlay={() => playSong(item.id)}
                                />}
                                <button className='bg-black text-white rounded-lg p-sm m-sm' id={item.id} onClick={() => handleGenerateMusicFile(item.id)}> Generate Music</button>
                                <button onClick={() => playSong(item.id)} disabled={!item.mediaUrl} className="bg-black text-white rounded-lg p-sm m-sm disabled:bg-slate-500">Play Song</button>
                            </div>}
                        </div>
                    })}
                </div>}


                <div className='footer w-screen flex justify-center gap-4 absolute bottom-0 bg-slate-200 items-center py-sm '>
                    <input type="text" className='w-[72vw] h-[45px] border-2 border-black p-sm rounded-lg' value={prompt ? prompt : ''} onChange={handleChange} />
                    <button className='border-[1px] border-black p-sm rounded-lg bg-white' onClick={handleClickComedy}>Generate Comedy Show</button>
                    <button className='border-[1px] border-black p-sm rounded-lg bg-white' onClick={handleClickMusic}>Generate Music</button>
                </div>
            </div>
        </>
    )
}



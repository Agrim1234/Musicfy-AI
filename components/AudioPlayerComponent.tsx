"use client"

import React, { ComponentPropsWithoutRef, PropsWithChildren, useEffect, useRef, useState } from 'react'
import { FaPause, FaPlay, FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import { IoMdDownload } from "react-icons/io";
import WavesurferPlayer from '@wavesurfer/react'
import WaveSurfer from 'wavesurfer.js'
import Image from 'next/image';
import { MdSkipNext, MdSkipPrevious } from 'react-icons/md';
import { audioResponse } from '@/app/generatemusic/page';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { currentIndexUpdated } from '@/app/features/audioResponses/currentIndex';

//const AudioPlayer = dynamic(() => import("react-modern-audio-player"), { ssr: false });

type AudioPlayerComponentProps = {
    responses: Array<audioResponse>,
    nowPlayingIndex: number,
}


const secondsToMinutesSeconds = (seconds: number):string => {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


const AudioPlayerComponent = () => {

    // const playList = [
    //     {
    //         writer: 'writer',
    //         src: audioResponses[nowPlayingIndex].song.srcUrl,
    //         name: name,
    //         id: id,
    //     },
    // ]



    // const [wavesurfer, setWavesurfer] = useState(null)
    // const [isPlaying, setIsPlaying] = useState(false)

    // const onReady = (ws: React.SetStateAction<null>) => {
    //     setWavesurfer(ws)
    //     setIsPlaying(false)
    // }

    // const onPlayPause = () => {
    //     wavesurfer && wavesurfer.playPause()
    // }


    // const playSong = (targetId: string) => {
    //     if (responses.find(r => r.id === targetId)?.audioResponses[nowPlayingIndex].song.srcUrl) {
    //         const audio = new Audio(responses.find(r => r.id === targetId)?.audioResponses[nowPlayingIndex].song.srcUrl);
    //         if (!audio.play()) {
    //             audio.play();
    //         }
    //     }
    // }

    // const handleSeeked = (e: any, targetId: string) => {
    //     if (responses.find(r => r.id === targetId)?.audioResponses[nowPlayingIndex].song.srcUrl) {
    //         const audio = new Audio(responses.find(r => r.id === targetId)?.audioResponses[nowPlayingIndex].song.srcUrl);
    //         console.log(audio.duration, e.target.value, e.target.getBoundingClientRect().width)
    //         // if (audioRef.current) {
    //         //     audioRef.current.currentTime = (e.target.value / e.target.getBoundingClientRect().width);
    //         // }  
    //     }
    // }

    // const handleVolumeChange = (e: any, targetId: string) => {
    //     if (responses.find(r => r.id === targetId)?.audioResponses[nowPlayingIndex].song.srcUrl) {
    //         const audio = new Audio(responses.find(r => r.id === targetId)?.audioResponses[nowPlayingIndex].song.srcUrl);
    //         audio.volume = e.target.value;
    //     }
    // }

    // const pauseSong = (targetId: string) => {
    //     if (responses.find(r => r.id === targetId)?.audioResponses[nowPlayingIndex].song.srcUrl) {
    //         const audio = new Audio(responses.find(r => r.id === targetId)?.audioResponses[nowPlayingIndex].song.srcUrl);
    //         console.log(audio)
    //         if (!audio.paused) {
    //             audio.pause();
    //         }
    //     }
    // }

    // const playVideo = (targetId: string) => {
    //     if (responses.find(r => r.id === targetId)?.audioResponses[nowPlayingIndex].song.srcUrl) {
    //         const video = document.getElementById(targetId);
    //         if (video) {
    //             setResponses(responses => responses.map(r =>
    //                 r.id === targetId ? { ...r, isPlaying: true } : r
    //             ))
    //         }
    //     }
    // }

    enum fileStatus {
        notLoading,
        loading,
        loaded,
        generateRequest,
    }

    const audioResponses:audioResponse[] = useAppSelector(state => state.audioResponses)
    const nowPlayingIndex: number = useAppSelector(state => state.currentIndex)
    const dispatch = useAppDispatch()
    let waveform: any
    const waveformRef = useRef<WaveSurfer | null>(null);
    //const currentAudio = useRef<audioResponse>(responses[nowPlayingIndex]);
    const [state, setState] = useState({ playing: false });
    const [audioVolume, setAudioVolume] = useState<number>(100)

    useEffect(() => {
        if (audioResponses.length > 0 && audioResponses[nowPlayingIndex].mediaFileStatus === fileStatus.loaded) {
            if (waveformRef.current) {
                waveformRef.current.destroy();
            }

            waveformRef.current = WaveSurfer.create({
                barWidth: 3,
                cursorWidth: 1,
                container: '#waveform',
                backend: 'WebAudio',
                height: 80,
                progressColor: '#2D5BFF',
                waveColor: '#d3e3fd',
                cursorColor: 'transparent',
            });

            try {
                const loadWaveform = async () => {
                    if (waveformRef.current) {
                        await new Promise((resolve) => {
                            if (waveformRef.current) {
                                waveformRef.current.load(audioResponses[nowPlayingIndex].song.srcUrl);
                            }
                            waveformRef.current?.on('finish', () => {
                                setState({ playing: false });
                            })
                            resolve(audioResponses[nowPlayingIndex].song.srcUrl);
                        });
                    }
                };

                loadWaveform();
            } catch (error) {
                console.error('Error loading audio:', error);
            }

            waveformRef.current.on('error', (error) => {
                console.error('WaveSurfer error:', error);
            });

            return () => {
                if (waveformRef.current) {
                    waveformRef.current.destroy();
                }
            };

        }

    }, [nowPlayingIndex]);

    const handlePlay = () => {
        setState({ playing: !state.playing });
        if (waveformRef.current) {
            waveformRef.current.playPause();
        }
    };

    // const handleShare = async () => {
    //     if (navigator.share) {
    //         try {
    //             await navigator.share({
    //                 title: waveformRef.current.song.name,
    //                 url: trackUrl,
    //             });
    //             console.log('Track shared successfully');
    //         } catch (error) {
    //             console.error('Error sharing track:', error);
    //         }
    //     } else {
    //         console.log('Web Share API is not supported in this browser');
    //     }
    // };

    const downloadAudioFile = async (url: string, fileName: string): Promise<void> => {
        try {
            // Fetch the audio file as a Blob
            const response = await fetch(url);

            // Check if the response is okay (status code 200-299)
            if (!response.ok) {
                throw new Error('Failed to download file');
            }
            // Convert the response to a Blob
            const blob = await response.blob();

            // Create an object URL from the Blob
            const objectUrl = URL.createObjectURL(blob);

            // Create an anchor element and set its href to the object URL
            const anchor = document.createElement('a');
            anchor.href = objectUrl;
            anchor.download = fileName;

            // Trigger the download
            anchor.click();

            // Revoke the object URL to free up memory
            URL.revokeObjectURL(objectUrl);
        } catch (error) {
            console.error('Error downloading the audio file:', error);
        }
    }

    const handleDownload = () => {
        let name = audioResponses[nowPlayingIndex].song.srcUrl.split('/')[1];
        downloadAudioFile(`${process.env.NEXT_PUBLIC_URL}/${audioResponses[nowPlayingIndex].song.srcUrl}`, name);
    }

    const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.value);
        setAudioVolume(parseInt(e.target.value))
        waveformRef.current?.setVolume(parseInt(e.target.value)/2)
        console.log(waveformRef.current?.getVolume())
    }

    const handlePrevious = () => {
        if ((nowPlayingIndex - 1) >= 0) {
            dispatch(currentIndexUpdated(nowPlayingIndex - 1))
            //audioResponses[nowPlayingIndex] = responses[nowPlayingIndex]
            console.log(audioResponses[nowPlayingIndex])
            try {
                const loadWaveform = async () => {
                    if (waveformRef.current) {
                        await new Promise((resolve) => {
                            if (waveformRef.current) {
                                waveformRef.current.load(audioResponses[nowPlayingIndex].song.srcUrl);
                            }
                            resolve(audioResponses[nowPlayingIndex].song.srcUrl);
                        });
                    }
                };

                loadWaveform();
            } catch (error) {
                console.error('Error loading audio:', error);
            }
            //audioResponses[nowPlayingIndex].song.srcUrl = responses[nowPlayingIndex - 1].song.srcUrl
        } else {
            dispatch(currentIndexUpdated(audioResponses.length - 1))
            console.log(nowPlayingIndex)
            try {
                const loadWaveform = async () => {
                    if (waveformRef.current) {
                        await new Promise((resolve) => {
                            if (waveformRef.current) {
                                waveformRef.current.load(audioResponses[nowPlayingIndex].song.srcUrl);
                            }
                            resolve(audioResponses[nowPlayingIndex].song.srcUrl);
                        });
                    }
                };

                loadWaveform();
            } catch (error) {
                console.error('Error loading audio:', error);
            }
        }
    }

    const handleNext = () => {
        //nowPlayingIndex = (nowPlayingIndex + 1) % audioResponses.length;
        dispatch(currentIndexUpdated((nowPlayingIndex + 1) % audioResponses.length))
        //audioResponses[nowPlayingIndex] = audioResponses[(nowPlayingIndex)];
        console.log(audioResponses[nowPlayingIndex])
        try {
            const loadWaveform = async () => {
                if (waveformRef.current) {
                    await new Promise((resolve) => {
                        if (waveformRef.current) {
                            waveformRef.current.load(audioResponses[nowPlayingIndex].song.srcUrl);
                        }
                        resolve(audioResponses[nowPlayingIndex].song.srcUrl);
                    });
                }
            };

            loadWaveform();
        } catch (error) {
            console.error('Error loading audio:', error);
        }

        //audioResponses[nowPlayingIndex].song.srcUrl = responses[((nowPlayingIndex + 1) % responses.length)].song.srcUrl
    }

    return (
        <div className='flex flex-col align-middle w-[96vw] m-sm h-[180px] items-center gap-2 bg-[#141414] rounded-lg'>
            <div className='flex gap-4 w-full items-center justify-center'>
                <div className=' text-white h-full flex items-center'>{waveformRef.current?.getCurrentTime() ? secondsToMinutesSeconds(waveformRef.current?.getCurrentTime()) : `00:00`}</div>
                <div id="waveform" className='w-[80%] h-[80px]' />
                <div className=' text-white'>{waveformRef.current?.getDuration() ? secondsToMinutesSeconds(waveformRef.current?.getDuration()) : `00:00`}</div>
            </div>

            <div className='flex gap-3 justify-around w-full'>
                <div className='flex items-center gap-4'>
                    <Image src={audioResponses[nowPlayingIndex].song.imageUrl ? audioResponses[nowPlayingIndex].song.imageUrl : '/apple.svg'} className='bg-slate-500' width={78} height={78} alt='music photo' />
                    <div className='flex flex-col'>
                        <p className='text-white'>User&apos;s song</p>
                        <p className='text-white'>User</p>
                    </div>
                </div>
                <div className='flex gap-4'>
                    <button className='w-[60px] h-[60px] bg-[#EFEFEF] rounded-full border-none outline-none cursor-pointer mt-3 pt-1' onClick={handlePrevious}>
                        <MdSkipPrevious className='text-4xl flex align-middle items-center w-full' />
                    </button>
                    <button onClick={handlePlay} className='w-[60px] h-[60px] bg-[#EFEFEF] rounded-full border-none outline-none cursor-pointer mt-3 pt-1'>
                        {state.playing ? <FaPause className='flex align-middle items-center w-full' /> : <FaPlay className='flex align-middle items-center w-full' />}
                    </button>
                    <button className='w-[60px] h-[60px] bg-[#EFEFEF] rounded-full border-none outline-none cursor-pointer mt-3 pt-1' onClick={handleNext}>
                        <MdSkipNext className='text-4xl flex align-middle items-center w-full' />
                    </button>
                </div>
                <div className='flex items-center'>
                    <button className="w-[60px] h-[60px] flex justify-center items-center rounded-full border-none outline-none cursor-pointer" title="Share on social media">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="flex items-center justify-center h-full text-white">
                            <circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"></line><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"></line>
                        </svg>
                    </button>
                    <button className='w-[60px] h-[60px] rounded-full flex align-middle items-center border-none outline-none cursor-pointer' onClick={handleDownload}>
                        <IoMdDownload className='text-2xl text-white w-full flex items-center' />
                    </button>
                    <div className='flex items-center gap-3 px-3'>
                        {
                            audioVolume === 0 ? <FaVolumeMute className='text-2xl text-white' /> : <FaVolumeUp className='text-2xl text-white' />
                        }
                        <input type="range" name='volume' className='flex items-center' value={audioVolume} onChange={(e) => changeVolume(e as unknown as React.ChangeEvent<HTMLInputElement>)} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AudioPlayerComponent

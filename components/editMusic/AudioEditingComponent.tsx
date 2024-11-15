"use client"

import React, { useEffect, useRef, useState } from 'react'
import { FaPause, FaPlay, FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import { IoMdDownload } from "react-icons/io";
import WaveSurfer from 'wavesurfer.js'
import Image from 'next/image';
import { FaFacebookF } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";
import { MdSkipNext, MdSkipPrevious } from 'react-icons/md';
import { MdEmail } from "react-icons/md";
import { audioResponse } from '@/app/generatemusic/page';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
//import { currentIndexUpdated } from '@/app/features/audioFilesToBeEdited/currentIndex';
//const AudioPlayer = dynamic(() => import("react-modern-audio-player"), { ssr: false });

type AudioPlayerComponentProps = {
    responses: Array<audioResponse>,
    0: number,
}

const secondsToMinutesSeconds = (seconds: number): string => {
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

    enum fileStatus {
        notLoading,
        loading,
        loaded,
        generateRequest,
    }
    const [showShareOptions, setShowShareOptions] = useState(false)
    const audioFilesToBeEdited = useAppSelector(state => state.audioFilesToBeEdited)
    //const 0: number = useAppSelector(state => state.currentIndex)
    const dispatch = useAppDispatch()
    const waveformRef = useRef<WaveSurfer | null>(null);
    const [state, setState] = useState({ playing: false });
    const [audioVolume, setAudioVolume] = useState<number>(100)
    const [currentSongUrl, setCurrentSongUrl] = useState('')

    useEffect(() => {
        if (audioFilesToBeEdited.length > 0 && audioFilesToBeEdited[0]) {
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
                                waveformRef.current.load(URL.createObjectURL(audioFilesToBeEdited[0]));
                            }
                            waveformRef.current?.on('finish', () => {
                                setState({ playing: false });
                            })
                            resolve(audioFilesToBeEdited[0]);
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

            setCurrentSongUrl(`${process.env.NEXT_PUBLIC_URL}/${audioFilesToBeEdited[0]}`)

            return () => {
                if (waveformRef.current) {
                    waveformRef.current.destroy();
                }
            };

        }

    }, [0]);

    const handlePlay = () => {
        setState({ playing: !state.playing });
        if (waveformRef.current) {
            waveformRef.current.playPause();
        }
    };

    const handleShare = async () => {
        if (navigator.share && waveformRef.current) {
            try {
                await navigator.share({
                    title: 'users song',
                    url: `${process.env.NEXT_PUBLIC_URL}/${audioFilesToBeEdited[0]}`
                });
                console.log('Track shared successfully');
            } catch (error) {
                console.error('Error sharing track:', error);
            }
        } else {
            //alert(`Web Share API is not supported in this browser. This is the song Url: ${process.env.NEXT_PUBLIC_URL}${audioFilesToBeEdited[0].song.srcUrl}`);
            setShowShareOptions(!showShareOptions);
        }
    };

    const downloadAudioFile = async (url: string, fileName: string): Promise<void> => {
        try {
            // Fetch the audio file as a Blob
            const response = await fetch(url);

            // Check if the response is okay (status code 200-299)
            // if (!response.ok) {
            //     throw new Error('Failed to download file');
            // }
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
        let name = audioFilesToBeEdited[0];
        downloadAudioFile(`${process.env.NEXT_PUBLIC_URL}/${audioFilesToBeEdited[0]}`, name as unknown as string);
    }

    const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.value);
        setAudioVolume(parseInt(e.target.value))
        waveformRef.current?.setVolume(Math.round(parseInt(e.target.value) / 4))
        console.log(waveformRef.current?.getVolume())
    }

    const handlePrevious = () => {
        if ((0 - 1) >= 0) {
            //dispatch(currentIndexUpdated(0 - 1))
            //audioFilesToBeEdited[0] = responses[0]
            console.log(audioFilesToBeEdited[0])
            try {
                const loadWaveform = async () => {
                    if (waveformRef.current) {
                        await new Promise((resolve) => {
                            if (waveformRef.current) {
                                waveformRef.current.load(URL.createObjectURL(audioFilesToBeEdited[0]));
                            }
                            resolve(audioFilesToBeEdited[0]);
                        });
                    }
                };

                loadWaveform();
            } catch (error) {
                console.error('Error loading audio:', error);
            }
            //audioFilesToBeEdited[0].song.srcUrl = responses[0 - 1].song.srcUrl
        } else {
            //dispatch(currentIndexUpdated(audioFilesToBeEdited.length - 1))
            console.log(0)
            try {
                const loadWaveform = async () => {
                    if (waveformRef.current) {
                        await new Promise((resolve) => {
                            if (waveformRef.current) {
                                waveformRef.current.load(URL.createObjectURL(audioFilesToBeEdited[0]));
                            }
                            resolve(audioFilesToBeEdited[0]);
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
        //0 = (0 + 1) % audioFilesToBeEdited.length;
        //dispatch(currentIndexUpdated((0 + 1) % audioFilesToBeEdited.length))
        //audioFilesToBeEdited[0] = audioFilesToBeEdited[(0)];
        console.log(audioFilesToBeEdited[0])
        try {
            const loadWaveform = async () => {
                if (waveformRef.current) {
                    await new Promise((resolve) => {
                        if (waveformRef.current) {
                            waveformRef.current.load(URL.createObjectURL(audioFilesToBeEdited[0]));
                        }
                        resolve(audioFilesToBeEdited[0]);
                    });
                }
            };

            loadWaveform();
        } catch (error) {
            console.error('Error loading audio:', error);
        }

        //audioFilesToBeEdited[0].song.srcUrl = responses[((0 + 1) % responses.length)].song.srcUrl
    }

    return (
        <div className='flex flex-col align-middle w-[96vw] m-sm h-[180px] items-center gap-2 bg-[#141414]'>
            <div className='flex gap-4 w-full items-center justify-center'>
                <div className=' text-white h-full flex items-center'>{waveformRef.current?.getCurrentTime() ? secondsToMinutesSeconds(waveformRef.current?.getCurrentTime()) : `00:00`}</div>
                <div id="waveform" className='w-[80%] h-[80px]' />
                <div className=' text-white'>{waveformRef.current?.getDuration() ? secondsToMinutesSeconds(waveformRef.current?.getDuration()) : `00:00`}</div>
            </div>

            <div className='flex gap-3 justify-around w-full'>
                <div className='flex items-center gap-4'>
    
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
                <div className='flex items-center relative'>
                    
                </div>
            </div>
        </div>
    )
}

export default AudioPlayerComponent

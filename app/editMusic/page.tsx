"use client"

import { Button } from '@/components/button';
import React, { useState, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { useAppDispatch, useAppSelector } from '../hooks';
import AudioEditingComponent from '@/components/editMusic/AudioEditingComponent';
import { audioFileAdded } from '../features/audioFilesToBeEdited/audioFilesToBeEdited';
import axios from 'axios';
import { FaFacebookF, FaTwitter } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';

const AudioEditor = () => {
    const [audioFile, setAudioFile] = useState<Blob | null>(null);
    const waveformRef = useRef(null);
    const wavesurfer = useRef<WaveSurfer | null>(null);
    const [editedAudioFile, setEditedAudioFile] = useState<Blob | null>(null)
    const audioFilesToBeEdited = useAppSelector(state => state.audioFilesToBeEdited);
    const dispatch = useAppDispatch()
    const [showShareOptions, setShowShareOptions] = useState(false)

    const handleFileUpload = async (e: { target: { files: FileList | null }; }) => {
        const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
        console.log(file?.name);
        setAudioFile(file);

        // Initialize WaveSurfer
        if (!wavesurfer.current && waveformRef.current) {
            wavesurfer.current = WaveSurfer.create({
                container: waveformRef.current,
                waveColor: '#ddd',
                progressColor: '#4a90e2',
            });
        }

        // Load file into WaveSurfer
        const reader = new FileReader();
        reader.onload = () => {
            if (reader.result !== null) {
                // wavesurfer.current?.load(reader.result as string);
                console.log("reader result: ", reader.result)
                const blob = new Blob([reader.result], { type: file!.type });

                // Create a new File from Blob
                const fileFromReaderResult = new File([blob], file!.name, {
                    type: file!.type,
                    lastModified: file!.lastModified,
                });
                console.log("file from reader result: ", fileFromReaderResult)
                dispatch(audioFileAdded(fileFromReaderResult));
            }
        }
        if (file !== null) {
            reader.readAsArrayBuffer(file);
            // try {
            //     const response = await axios.post(process.env.NEXT_PUBLIC_UPLOAD_MERGED_AUDIO ? process.env.NEXT_PUBLIC_UPLOAD_MERGED_AUDIO : '', { fileName, fileType }, {
            //         headers: {
            //             "Content-Type": "application/json",
            //         }
            //     })
            // } catch (error) {
            //     console.log(error)
            // }

            // try {
            //     const responsePutPresignedUrl = await fetch(presignedUrl, {
            //         method: 'PUT',
            //         body: outputData,
            //         headers: {
            //             'Content-Type': 'audio/mpeg',
            //             'Content-Length': outputData.length.toString()
            //         }
            //     });

            //     await sleep(1000);

            //     responseFetchPresignedUrl = await axios.post(process.env.NEXT_PUBLIC_FETCH_AUDIO_FILE_PRESIGNED_URL ? process.env.NEXT_PUBLIC_FETCH_AUDIO_FILE_PRESIGNED_URL : '',
            //         { fileName }, {
            //         headers: {
            //             'Content-Type': 'application/json',
            //         }
            //     })

            // } catch (error) {
            //     console.log(error);
            // }
        }
    };

    const handleTrim = () => {
        const formData = new FormData();
        if (audioFile) {
            formData.append('audio', editedAudioFile ? editedAudioFile : audioFile);
        } else {
            alert("Please select an audio file");
        }
        formData.append('start', "5");
        formData.append('end', "12");

        fetch('https://musicfy-backend-production.up.railway.app/trim', {
            method: 'POST',
            body: formData,
        })
            .then((res) => res.blob())
            .then((blob) => {
                setEditedAudioFile(blob)
                //const url = URL.createObjectURL(blob);
                // const a = document.createElement('a');
                // a.href = url;
                // a.download = 'trimmed-audio.mp3';
                // a.click();
            });
    };

    const handleChangeVolume = () => {
        const formData = new FormData();

        if (audioFile) {
            formData.append('audio', editedAudioFile ? editedAudioFile : audioFile);
        } else {
            alert("Please select an audio file");
        }
        formData.append('volume', "5");

        fetch('https://musicfy-backend-production.up.railway.app/adjust-volume', {
            method: 'POST',
            body: formData,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'multipart/form-data'
            }
        })
            .then((res) => res.blob())
            .then((blob) => {
                setEditedAudioFile(blob)
                const url = URL.createObjectURL(blob);
                // const a = document.createElement('a');
                // a.href = url;
                // a.download = 'trimmed-audio.mp3';
                // a.click();
            });
    };

    const handleAddSilence = () => {
        const formData = new FormData();

        if (audioFile) {
            formData.append('audio', editedAudioFile ? editedAudioFile : audioFile);
        } else {
            alert("Please select an audio file");
        }
        formData.append('volume', "5");

        fetch('https://musicfy-backend-production.up.railway.app/add-silence', {
            method: 'POST',
            body: formData,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'multipart/form-data'
            }
        })
            .then((res) => res.blob())
            .then((blob) => {
                setEditedAudioFile(blob)
                // const url = URL.createObjectURL(blob);
                // const a = document.createElement('a');
                // a.href = url;
                // a.download = 'trimmed-audio.mp3';
                // a.click();
            });
    };

    const handleSave = () => {
        if (editedAudioFile) {
            const url = URL.createObjectURL(editedAudioFile);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'edited-audio.mp3';
            a.click();
        }
    }

    const handleIncreaseSpeed = () => {
        console.log("increasing speed")
    }

    const handleIncreasePitch = () => {
        console.log("increasing pitch")
    }

    const handleClickShare = async () => {
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

    return (
        <div className='flex flex-col'>
            <div className='flex justify-between mx-10 bg-secondary/15 shadow-lg shadow-neutral-600/5 backdrop-blur-lg border border-primary/10 p-6 rounded-2xl m-8'>
                <h2 className='text-4xl'>Audio Editor</h2>
                <div className='flex gap-4'>
                    <div className='flex justify-center items-center'>
                        <label htmlFor="upload-audio" className='flex justify-center items-center text-xl text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg px-5 py-2.5 [text-decoration:none] w-60'>
                            Upload audio
                        </label>
                    </div>
                    <input type="file" id='upload-audio' onChange={handleFileUpload} accept="audio/*" className='hidden' />
                    <button onClick={handleSave} className="text-white text-xl w-60 bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg px-5 py-2.5 me-2">Save</button>
                </div>
            </div>
            {/* <div ref={waveformRef} style={{ width: '100%', height: '100px' }} /> */}
            <div className='flex flex-col bg-secondary/15 shadow-lg shadow-neutral-600/5 backdrop-blur-lg border border-primary/10 p-6 rounded-2xl m-3'>
                <div className='flex justify-between bg-secondary/15 backdrop-blur-lg p-6 rounded-2xl m-3'>
                    <div>
                        <Button onClick={handleTrim}>Trim</Button>
                        <Button onClick={handleChangeVolume}>Change Volume</Button>
                        <Button onClick={handleAddSilence}>Add Silence</Button>
                        <Button onClick={handleIncreaseSpeed}>Increase Speed</Button>
                        <Button onClick={handleIncreasePitch}>Increase Pitch</Button>
                        <Button onClick={handleSave}>Loop</Button>
                    </div>
                    <div className='flex justify-end'>
                        <Button onClick={handleClickShare}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="flex items-center justify-center h-full text-white">
                                <circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"></line><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"></line>
                            </svg>
                        </Button>
                        {showShareOptions && audioFile !== null && (
                            <div className="share-options absolute bg-black border-[1px] border-white p-3 -right-2 rounded-xl">
                                <ul className='flex flex-col gap-3'>
                                    <li>
                                        <a
                                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(URL.createObjectURL(editedAudioFile ? editedAudioFile : audioFile))}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <FaFacebookF className='text-2xl text-white' />
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('users song')}&url=${encodeURIComponent(URL.createObjectURL(editedAudioFile ? editedAudioFile : audioFile))}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <FaTwitter className='text-2xl text-white' />
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href={`mailto:?subject=Check out this song: ${encodeURIComponent('users song')}&body=${encodeURIComponent(URL.createObjectURL(editedAudioFile ? editedAudioFile : audioFile))}`}
                                        >
                                            <MdEmail className='text-2xl text-white' />
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>

                </div>
                {audioFilesToBeEdited.length > 0 && (
                    <AudioEditingComponent />
                )}
            </div>
            {/* Add more controls as needed */}
        </div>
    );
};

export default AudioEditor;
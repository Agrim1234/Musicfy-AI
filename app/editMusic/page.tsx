"use client"

import { Button } from '@/components/button';
import React, { useState, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { useAppDispatch, useAppSelector } from '../hooks';
import AudioEditingComponent from '@/components/editMusic/AudioEditingComponent';
import { audioFileAdded } from '../features/audioFilesToBeEdited/audioFilesToBeEdited';
import axios from 'axios';

const AudioEditor = () => {
    const [audioFile, setAudioFile] = useState<Blob | null>(null);
    const waveformRef = useRef(null);
    const wavesurfer = useRef<WaveSurfer | null>(null);
    const [editedAudioFile, setEditedAudioFile] = useState<Blob | null>(null)
    const audioFilesToBeEdited = useAppSelector(state => state.audioFilesToBeEdited);
    const dispatch = useAppDispatch()

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
        // Make an API call to trim (example with start/end hard-coded)
        const formData = new FormData();

        if (audioFile) {
            formData.append('audio', editedAudioFile ? editedAudioFile : audioFile);
        } else {
            alert("Please select an audio file");
        }
        formData.append('start', "5");
        formData.append('end', "12");

        fetch('http://localhost:5000/trim', {
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
        // Make an API call to trim (example with start/end hard-coded)
        const formData = new FormData();

        if (audioFile) {
            formData.append('audio', editedAudioFile ? editedAudioFile : audioFile);
        } else {
            alert("Please select an audio file");
        }
        formData.append('volume', "5");

        fetch('http://localhost:5000/adjust-volume', {
            method: 'POST',
            body: formData,
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
        // Make an API call to trim (example with start/end hard-coded)
        const formData = new FormData();

        if (audioFile) {
            formData.append('audio', editedAudioFile ? editedAudioFile : audioFile);
        } else {
            alert("Please select an audio file");
        }
        formData.append('volume', "5");

        fetch('http://localhost:5000/add-silence', {
            method: 'POST',
            body: formData,
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

    return (
        <div className='flex flex-col'>
            <h2>Audio Editor</h2>
            <input type="file" onChange={handleFileUpload} accept="audio/*" />
            {/* <div ref={waveformRef} style={{ width: '100%', height: '100px' }} /> */}
            <div>
                <Button onClick={handleTrim}>Trim</Button>
                <Button onClick={handleChangeVolume}>Change Volume</Button>
                <Button onClick={handleAddSilence}>Add Silence</Button>
                <Button onClick={handleSave}>Save</Button>
            </div>
            {audioFilesToBeEdited.length > 0 && (
                <AudioEditingComponent />
            )}
            {/* Add more controls as needed */}
        </div>
    );
};

export default AudioEditor;
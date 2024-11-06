import { NextResponse } from 'next/server';
import gtts from 'gtts';
import path from 'path';
import OpenAi from "openai"
import fs from 'fs';
import { exec } from 'child_process';
import { tagFileData, tagFileMap } from '@/app/constants';
import Groq from "groq-sdk";
import axios from 'axios';
import { headers } from 'next/headers';
//import { utapi } from "@/app/api/uploadthing/route";


type mergeAudioProps = {
    fileInput: string,
    outputFile: string,
    tag: string,
    clarityValue: number,
    speedValue: number,
    backgroundMusic: string
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

// async function uploadFiles(file: File) {
//     // const files = formData.getAll("files") as File[];
//     const response = await utapi.uploadFiles(file);
//     return response;
//     //    ^? UploadedFileResponse[]
// }

const sleep = (ms: number | undefined) => new Promise(resolve => setTimeout(resolve, ms));

async function createAndUploadAudioFile(text: string, tag: string) {
    let person = '';
    if (!text) {
        return;
    }

    if (tag === 'Male') {
        person = 'Brian';
    } else {
        person = 'Joanna'
    }

    try {
        const response: any = await fetch(process.env.NEXT_PUBLIC_FETCH_AUDIO ? process.env.NEXT_PUBLIC_FETCH_AUDIO : '', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                promptResponse: text,
                personName: person
            }),
        });
        console.log("response:", response)
        const data = await response.json();
        console.log("datapopularity", data);
        return data["data"];
    } catch (error) {
        return error
    }
}


const mergeAudio = async ({ fileInput, outputFile, tag, clarityValue, speedValue, backgroundMusic }: mergeAudioProps) => {
    let durationAudio = '0:0'
    let responseFetchPresignedUrl: any;
    try {
        let tempFile = `${fileInput.split('.')[0]}_childish.mp3`;
        let tagData = tagFileMap.get(backgroundMusic) ? tagFileMap.get(backgroundMusic) : 'public/jazz.mp3'
        let speed = Math.round(speedValue / 100) * (1.5)
        speed = parseFloat(speedValue.toFixed(1))
        let clarity = (((100 - clarityValue) / 100) * 10000) + 25100;
        await new Promise(async (resolve, reject) => {
            // exec('ffmpeg -i ' + fileInput + ' -filter_complex "asetrate=' + clarity + '*1.25,atempo=0.7" -t 30 ' + tempFile + '', (error, stdout, stderr) => {
            //     // ... (same error handling and output file availability as above)
            //     if (error) {
            //         console.error(`exec error: ${error}`);
            //         reject(error);
            //         return;
            //     }
            //     console.log(stdout)
            //     if (tagData) {

            let fileName = outputFile.split("/")[1]
            let fileType = 'audio'
            let response: any;
            try {
                response = await axios.post(process.env.NEXT_PUBLIC_UPLOAD_MERGED_AUDIO ? process.env.NEXT_PUBLIC_UPLOAD_MERGED_AUDIO : '', { fileName, fileType }, {
                    headers: {
                        "Content-Type": "application/json",
                    }
                })
            } catch (error) {
                console.log(error)
            }


            const presignedUrl = response.data.presignedUrl;
            const ffmpegCommand = 'ffmpeg -i "' + fileInput + '" -i ' + tagData + ' -f mp3 -filter_complex "amix=inputs=2:duration=first" -t 30 -y pipe:1';

            exec(ffmpegCommand, { encoding: 'buffer', maxBuffer: Infinity }, async (error, stdout, stderr) => {
                // ... (same error handling and output file availability as above)
                if (error) {
                    console.error(`exec error: ${error}`);
                    return;
                }

                if (stderr) {
                    console.log('FFmpeg stderr:', stderr.toString());
                }

                // Process the output data (stdout contains the audio data in Buffer format)
                const outputData = stdout;
                await sleep(1000)
                try {
                    const responsePutPresignedUrl = await fetch(presignedUrl, {
                        method: 'PUT',
                        body: outputData,
                        headers: {
                            'Content-Type': 'audio/mpeg',
                            'Content-Length': outputData.length.toString()
                        }
                    });

                    await sleep(1000);

                    responseFetchPresignedUrl = await axios.post(process.env.NEXT_PUBLIC_FETCH_AUDIO_FILE_PRESIGNED_URL ? process.env.NEXT_PUBLIC_FETCH_AUDIO_FILE_PRESIGNED_URL : '',
                        { fileName }, {
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    })

                } catch (error) {
                    console.log(error);
                }

                exec('ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ' + responseFetchPresignedUrl.data + '', (error, stdout, stderr) => {
                    durationAudio = stdout
                    resolve(outputFile);
                })
            });
            //     }
            // })
        })
    } catch (error) {
        console.error('Error:', error);
    }
    let url = responseFetchPresignedUrl.data

    return { url, durationAudio };
}

export const POST = async (req: any) => {
    const { elementId, tag, speedValue, clarityValue, prompt, backgroundMusic } = await req.json();
    console.log(tag);
    if (!prompt) {
        return NextResponse.json({ error: 'promptMusicGeneration query parameter is required' });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    //const openai = new OpenAi({ apiKey: process.env.OPENAI_API_KEY });
    const response = await groq.chat.completions.create({
        model: "llama3-8b-8192",
        messages: [
            { role: "system", content: "Respond only with medium length musical lyrics number of words should be between 70 and 80 without 🎵" },
            { role: "user", content: prompt }
        ]
    });

    let responseText = '';
    if (response.choices && response.choices.length > 0) {
        responseText = response.choices[0].message.content || '';
    }

    //console.log(responseText)
    const responseUrl = await createAndUploadAudioFile(responseText, tag);

    // Generate speech from the prompt using Google Text-to-Speech API
    //const speech = new gtts(responseText, 'en');
    //const backgroundPath = 'public/child-audio.mp3'
    //const inputFilePath = `tmp/${elementId}_speech.mp3`
    //const outputFilePath = `tmp/${elementId}_output.mp3`
    //const filePath = path.join(process.cwd(), 'tmp', `${elementId}_speech.mp3`);
    //console.log(filePath)
    //const filePathOutput = path.join(process.cwd(), outputFilePath);
    let durationAudioFile = '0:0';

    // // Remove old overlay file if it exists
    // if (fs.existsSync(filePath)) {
    //     fs.unlinkSync(filePath);
    // }
    // // Save the generated speech to a temporary file
    //let output = `/animation-music.mp3`;
    // console.log(speech);
    try {
        //     await new Promise((resolve, reject) => {
        //         speech.save(filePath, async (err: any) => {
        //             if (err) {
        //                 console.error(err);
        //                 reject(err);
        //             } else {

        //                 const response = await uploadFiles(filePath as unknown as File)
        //                 console.log(response)

        //                 try {
        //                     const data = await mergeAudio({ fileInput: inputFilePath, outputFile: outputFilePath, tag, clarityValue, speedValue });
        //                     durationAudioFile = secondsToMinutesSeconds(parseFloat(data.durationAudio));
        //                     console.log(output, ' done ');
        //                     resolve(output);
        //                 } catch (mergeError) {
        //                     reject(mergeError);
        //                 }
        //             }
        //         })
        //     })

        await sleep(3000);

        //let presignedUrlOutput = '';
        //let fileName = `${elementId}_output.mp3`;
        // try {
        //     const responseUploadAudio:any = await axios.post(process.env.NEXT_PUBLIC_UPLOAD_MERGED_AUDIO ? process.env.NEXT_PUBLIC_UPLOAD_MERGED_AUDIO : '', { fileName, fileType: 'audio' }, {
        //         headers: {
        //             "Content-Type": "application/json",
        //         }
        //     })

        //     presignedUrlOutput = responseUploadAudio.data.presignedUrl
        // } catch (error) {
        //     console.log(error)
        // }

        const response = await fetch('https://musicfy-ai.vercel.app/generate-music-audio', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'  // Set Content-Type to JSON
            },
            body: JSON.stringify({
                fileInput: responseUrl,
                outputFile: `${elementId}_output.mp3`,
                clarityValue,
                speedValue,
                backgroundMusic
            }),
        })
        //const data = await mergeAudio({ fileInput: responseUrl, outputFile: `public/${elementId}_output.mp3`, tag, clarityValue, speedValue, backgroundMusic });

        const data = await response.json();
        console.log("data: ", data)
        // const responseImageUrl = await openai.images.generate({
        //     model: "dall-e-2",
        //     prompt: responseText,
        //     n: 1,
        //     size: "256x256",
        // });

        const image_url = 'https://images.pexels.com/photos/7260262/pexels-photo-7260262.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';

        return NextResponse.json({ file: data, value: responseText, imageUrl: image_url, duration: durationAudioFile, poemData: responseText });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Failed to generate or process speech' });
    }
}
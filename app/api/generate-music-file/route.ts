import { NextResponse } from 'next/server';
import gtts from 'gtts';
import path from 'path';
import OpenAi from "openai"
import fs from 'fs';
import { exec } from 'child_process';
import { tagFileData } from '@/app/constants';
import { utapi } from "@/app/api/uploadthing/route";


type mergeAudioProps = {
    fileInput: string,
    outputFile: string,
    tag: string,
    clarityValue: number,
    speedValue: number,
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

async function uploadFiles(file: File) {
    // const files = formData.getAll("files") as File[];
    const response = await utapi.uploadFiles(file);
    return response;
    //    ^? UploadedFileResponse[]
}

async function createAndUploadAudioFile(text: string) {
    const response : any = await fetch(process.env.NEXT_PUBLIC_FETCH_AUDIO ? process.env.NEXT_PUBLIC_FETCH_AUDIO : '', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            promptResponse: text
        }),
    });
    console.log("response:", response)
    const data = await response.json();
    console.log("datapopularity", data);
    return data["data"];
}


const mergeAudio = async ({ fileInput, outputFile, tag, clarityValue, speedValue }: mergeAudioProps) => {
    let durationAudio = '0:0'
    try {
        let tempFile = `${fileInput.split('.')[0]}_childish.mp3`;
        let tagData = tagFileData.find(t => t.tagName === tag)
        let speed = Math.round(speedValue / 100) * (1.5)
        speed = parseFloat(speedValue.toFixed(1))
        let clarity = (((100 - clarityValue) / 100) * 10000) + 25100;
        await new Promise((resolve, reject) => {
            exec('ffmpeg -i ' + fileInput + ' -filter_complex "asetrate=' + clarity + '*1.25,atempo=0.7" -t 30 ' + tempFile + '', (error, stdout, stderr) => {
                // ... (same error handling and output file availability as above)
                if (error) {
                    console.error(`exec error: ${error}`);
                    reject(error);
                    return;
                }
                console.log(stdout)
                if (tagData) {
                    exec('ffmpeg -i ' + tempFile + ' -i ' + tagData.fileName + ' -filter_complex "amix=inputs=2:duration=first" -t 30 ' + outputFile + ' -y', (error, stdout, stderr) => {
                        // ... (same error handling and output file availability as above)
                        if (error) {
                            console.error(`exec error: ${error}`);
                            return;
                        }

                        exec('ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ' + outputFile + '', (error, stdout, stderr) => {
                            durationAudio = stdout
                            resolve(outputFile);
                        })

                    });
                }

            })

        })
    } catch (error) {
        console.error('Error:', error);
    }

    return { outputFile, durationAudio };
}

export const POST = async (req: any) => {
    const { elementId, tag, speedValue, clarityValue, prompt } = await req.json();

    if (!prompt) {
        return NextResponse.json({ error: 'promptMusicGeneration query parameter is required' });
    }

    const openai = new OpenAi({ apiKey: process.env.OPENAI_API_KEY });

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        temperature: 0,
        max_tokens: 200,
        n: 1,
        messages: [
            { role: "system", content: "Respond only with medium length poems number of words should be between 50 and 60 without 🎵" },
            { role: "user", content: prompt }
        ]
    });

    let responseText = '';

    if (response.choices && response.choices.length > 0) {
        responseText = response.choices[0].message.content || '';
    }

    console.log(responseText)

    const responseUrl = await createAndUploadAudioFile(responseText);

    // Generate speech from the prompt using Google Text-to-Speech API
    const speech = new gtts(responseText, 'en');
    //const backgroundPath = 'public/child-audio.mp3'
    const inputFilePath = `tmp/${elementId}_speech.mp3`
    const outputFilePath = `tmp/${elementId}_output.mp3`
    const filePath = path.join(process.cwd(), 'tmp', `${elementId}_speech.mp3`);
    console.log(filePath)
    const filePathOutput = path.join(process.cwd(), outputFilePath);
    let durationAudioFile = '0:0';

    // // Remove old overlay file if it exists
    // if (fs.existsSync(filePath)) {
    //     fs.unlinkSync(filePath);
    // }

    // // Save the generated speech to a temporary file
    let output = `/animation-music.mp3`;
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

        const responseImageUrl = await openai.images.generate({
            model: "dall-e-2",
            prompt: responseText,
            n: 1,
            size: "256x256",
        });

        const image_url = responseImageUrl.data[0].url;
        console.log(image_url);

        console.log(output)
        return NextResponse.json({ file: responseUrl, value: responseText, imageUrl: image_url, duration: durationAudioFile, poemData: responseText });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Failed to generate or process speech' });
    }
}
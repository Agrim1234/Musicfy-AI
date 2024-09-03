import { NextResponse } from 'next/server';
import gtts from 'gtts';
import path from 'path';
import OpenAi from "openai"
import fs from 'fs';
import { exec } from 'child_process';
import { tagFileData } from '@/app/constants';

type mergeAudioProps = {
    fileInput: string,
    outputFile: string,
    tag: string,
    clarityValue: number,
    speedValue: number,
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
                        //console.log(`stderr: ${stderr}`);

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

    return {outputFile, durationAudio};
}

export const POST = async (req: any) => {
    const { elementId, tag, speedValue, clarityValue, prompt } = await req.json();

    //console.log(prompt, " ", id, " ", speedValue, clarityValue, " ", tag)
    // let raw = JSON.stringify({
    //     "key": '******',
    //     "genres": [
    //         "Electronica"
    //     ],
    //     "moods": [
    //         "Busy & Frantic"
    //     ],
    //     "themes": [
    //         "Ads & Trailers"
    //     ],
    //     "length": 60,
    //     "file_format": [
    //         "wav"
    //     ],
    //     "mute_stems": [
    //         "bs"
    //     ],
    //     "tempo": [
    //         "normal"
    //     ],
    //     "energy_levels": [
    //         {
    //             "start": 0,
    //             "end": 6.5,
    //             "energy": "Very High"
    //         }
    //     ]
    // });



    // const response = await fetch('https://soundraw.io/api/v2/musics/compose', { method: 'POST', body: raw, headers: { 'Content-Type': 'application/json' } });


    // A simple function to map promptMusicGeneration characters to musical notes
    // const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'];
    // const noteSequence = [];

    // // Map each character to a note based on its char code
    // for (let i = 0; i < promptMusicGeneration.length; i++) {
    //     const charCode = promptMusicGeneration.charCodeAt(i);
    //     const noteIndex = charCode % notes.length;
    //     noteSequence.push(notes[noteIndex]);
    // }


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
            { role: "system", content: "Respond only with medium length musical songs number of words should be between 100 and 120 without 🎵" },
            { role: "user", content: prompt }
        ]
    });

    let responseText = '';

    if (response.choices && response.choices.length > 0) {
        responseText = response.choices[0].message.content || '';
    }

    // Generate speech from the prompt using Google Text-to-Speech API
    const speech = new gtts(responseText, 'en');
    const backgroundPath = 'public/child-audio.mp3'
    const inputFilePath = `public/${elementId}_speech.mp3`
    const outputFilePath = `public/${elementId}_output.mp3`
    const filePath = path.join(process.cwd(), inputFilePath);
    console.log(filePath)
    const filePathOutput = path.join(process.cwd(), outputFilePath);
    let durationAudioFile = '0:0';

    // Remove old overlay file if it exists
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    // Save the generated speech to a temporary file
    let output = `public/${elementId}_output.mp3`;
    try {
        await new Promise((resolve, reject) => {
            speech.save(filePath, async (err: any) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    try {
                        const data = await mergeAudio({ fileInput:inputFilePath, outputFile:outputFilePath, tag, clarityValue, speedValue});
                        durationAudioFile = secondsToMinutesSeconds(parseFloat(data.durationAudio));
                        console.log(output, ' done ');
                        resolve(output);
                    } catch (mergeError) {
                        reject(mergeError);
                    }
                }
            })
        })

        const responseImageUrl = await openai.images.generate({
            model: "dall-e-2",
            prompt: responseText,
            n: 1,
            size: "256x256",
        });

        const image_url = responseImageUrl.data[0].url;
        console.log(image_url);

        console.log(output)
        return NextResponse.json({ file: output.split('/')[1], value: responseText, imageUrl: image_url, duration: durationAudioFile });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Failed to generate or process speech' });
    }

    // let response = undefined
    // exec('ffmpeg -i ' + overlayPath + ' -i public/child-audio.mp3 -filter_complex "amix=inputs=2:duration=first" ' + outputPath + ' -y', (error, stdout, stderr) => {
    //     // ... (same error handling and output file availability as above)
    //     return NextResponse.json({ file: outputPath });
    // });

    //console.log(response)

    // try {
    //   // Get the Base64-encoded audio data
    //   // const audioBase64 = await new Promise((resolve, reject) => {
    //   //   speech.getAudioBase64((err, base64) => {
    //   //     if (err) reject(err);
    //   //     else resolve(base64);
    //   //   });
    //   // });

    //   // Convert Base64 to Buffer
    //   //const audioBuffer = Buffer.from(audioBase64, 'base64');

    //   // await fs.writeFile(filePath, speech.toString(), (err) => {
    //   //   if (err) throw err;
    //   //   console.log('The file has been saved!');
    //   // }
    //   // )

    // } catch (error) {
    //   console.error('Error:', error);
    //   //return NextResponse.json({ error: 'Failed to generate or process speech' });
    // }
}
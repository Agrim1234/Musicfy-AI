import React from 'react'
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import Anthropic from "@anthropic-ai/sdk";
import OpenAi from "openai"


export const POST = async (req: Request) => {
    const { promptVideoGeneration } = await req.json();
    const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
    console.log(promptVideoGeneration)
    const openai = new OpenAi({ apiKey: process.env.OPENAI_API_KEY });

    const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: promptVideoGeneration,
        n: 1,
        size: "1024x1024",
    });

    // let responseText = '';

    // // if ('text' in content) {//-
    // //     responseText = content.text;//-
    // if (response.choices && response.choices.length > 0) {
    //     responseText = response.choices[0].message.content || '';
    // }

    const image_url = response.data[0].url;
    console.log(image_url);

    // const response = await anthropic.messages.create({
    //     model: "claude-3-5-sonnet-20240620",
    //     max_tokens: 1000,
    //     temperature: 0,
    //     system: "choose which category this statement lies in (political, economic, entertainment, historic, office, children, school, education, formal, informal) - answer in one word in lowercase",
    //     messages: [
    //         {
    //             "role": "user",
    //             "content": [
    //                 {
    //                     "type": "text",
    //                     "text": promptVideoGeneration
    //                 }
    //             ]
    //         }
    //     ]
    // });

    // const content = response.content[0];
    // let responseText = '';

    // if ('text' in content) {
    //     responseText = content.text;
    // }

    // Create a video using the generated text
    // let input = `public/${responseText}.mp4`
    // let output = `/output.mp4`;

    // const videoCommand = "ffmpeg -i public/" + responseText + ".mp4 -vf drawtext=fontfile=arial.ttf:text=" + promptVideoGeneration + ":fontcolor=white:fontsize=48 public/output.mp4";
    // exec(videoCommand, (error, stdout, stderr) => {
    //     if (error) {
    //         console.error(`exec error: ${error}`);
    //         return;
    //     }
    //     console.log(`stdout: ${stdout}`);
    //     console.log(`stderr: ${stderr}`);
    // });

    // Return the generated video URL

    let responseVideo = fetch('https://api.creatomate.com/v1/renders', {
        method: 'POST',
        headers: {
            'Authorization': 'c3c713d9a9874684a5d407141e959da283850bd448612545e662ce9fe4bc1a1c1a15e3c8782777cc48fc52a7d9d45bd6',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "tags": ["youtube"],
            "modifications": {
                "my-element.text": promptVideoGeneration
            }
        })
    })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));


    return NextResponse.json({ file: '/entertainment.mp4' });

    //return NextResponse.json(response);

}

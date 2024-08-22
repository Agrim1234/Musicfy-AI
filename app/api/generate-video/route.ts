import React from 'react'
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import Anthropic from "@anthropic-ai/sdk";



export const POST = async (req: Request) => {
    const { promptVideoGeneration } = await req.json();
    const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
    console.log(promptVideoGeneration)

    const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 1000,
        temperature: 0,
        system: "choose which category this statement lies in (political, economic, entertainment, historic, office, children, school, education, formal, informal) - answer in one word in lowercase",
        messages: [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": promptVideoGeneration
                    }
                ]
            }
        ]
    });

    const content = response.content[0];
    let responseText = '';

    if ('text' in content) {
        responseText = content.text;
    }

    // Create a video using the generated text
    let input = `public/${responseText}.mp4`
    let output = `/output.mp4`;

    const videoCommand = "ffmpeg -i public/" + responseText + ".mp4 -vf drawtext=fontfile=arial.ttf:text=" + promptVideoGeneration + ":fontcolor=white:fontsize=48 public/output.mp4";
    exec(videoCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
    });

    // Return the generated video URL
    

    return NextResponse.json({ file:output });

    //return NextResponse.json(response);

}

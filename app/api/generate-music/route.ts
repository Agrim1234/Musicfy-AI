import React from 'react'
import { NextResponse } from 'next/server';
import Anthropic from "@anthropic-ai/sdk";

export const POST = async (req: Request) => {
    const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
    const { prompt } = await req.json();

    console.log(prompt)

    const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 1000,
        temperature: 0,
        system: "Respond only with short Musical songs.",
        messages: [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt
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

    return NextResponse.json(responseText);
}
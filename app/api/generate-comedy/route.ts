import React from 'react'
import { NextResponse } from 'next/server';
import Anthropic from "@anthropic-ai/sdk";
import OpenAi from "openai"

export const POST = async (req: Request) => {
    //const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
    const openai = new OpenAi({ apiKey: process.env.OPENAI_API_KEY });

    const { prompt } = await req.json();

    console.log(prompt)

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        temperature: 0,
        max_tokens: 200,
        n: 1,
        messages: [
            { role: "system", content: "Respond only with short comedy stories" },
            {role: "user", content: prompt}
        ]
    });

    // const response = await anthropic.messages.create({//-
    //     model: "claude-3-5-sonnet-20240620",//-
    //     max_tokens: 1000,//-
    //     temperature: 0,//-
    //     system: "Respond only with short comedy stories.",//-
    //     messages: [//-
    //         {//-
    //             "role": "user",//-
    //             "content": [//-
    //                 {//-
    //                     "type": "text",//-
    //                     "text": prompt//-
    //                 }//-
    //             ]//-
    //         }//-
    //     ]//-
    // });//-
    // const content = response.content[0];//-
    let responseText = '';

    // if ('text' in content) {//-
    //     responseText = content.text;//-
    if (response.choices && response.choices.length > 0) {
        responseText = response.choices[0].message.content || '';
    }

    return NextResponse.json(responseText);
}



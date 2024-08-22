import React from 'react'
import { NextResponse } from 'next/server';

export const POST = async (req: Request) => {
    const { id } = await req.json();

    console.log(id)

    let raw = JSON.stringify({
        "key": process.env.MODELSLAB_API_KEY,
    });

    const response = await fetch(`https://modelslab.com/api/v6/realtime/fetch/${id}`, { method: 'POST', body: raw, headers: {'Content-Type': 'application/json'} });
    return NextResponse.json(response);
}


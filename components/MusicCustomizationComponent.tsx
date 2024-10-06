"use client"

import React, { useState } from 'react'
import "@/app/globals.css";
import { v4 as uuidv4 } from 'uuid';


export type musicChildComponentDatatype = {
    id: string,
    tag: string,
    prompt: string,
    speedValue: number,
    clarityValue: number,
}

const MusicCustomizationComponent = ({ childData }: any) => {


    const [musicCustomizationData, setMusicCustomizationData] = useState<musicChildComponentDatatype>({ prompt: '', id: uuidv4(), tag: 'joyful', speedValue: 50, clarityValue: 50 })
    const [selected, setSelected] = useState<string>('')

    const handleChange = (e: any) => {
        setMusicCustomizationData({ ...musicCustomizationData, prompt: e.target.value });
    }

    const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMusicCustomizationData({ ...musicCustomizationData, speedValue: Number(e.target.value) });
        console.log(musicCustomizationData)
    }

    const handleClarityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMusicCustomizationData({ ...musicCustomizationData, clarityValue: Number(e.target.value) });
        console.log(musicCustomizationData)
    }

    const handleTagChange = (e: React.ChangeEvent<HTMLDivElement>) => {
        setSelected(e.target.id);
        console.log(selected)
        setMusicCustomizationData({ ...musicCustomizationData, tag: e.target.innerHTML });
        console.log(musicCustomizationData)
    }

    const handleDataSubmission = () => {
        console.log(musicCustomizationData);
        childData(musicCustomizationData);
    }

    return (
        <div className='w-4/6 p-lg bg-slate-300 rounded-lg z-0 m-md flex flex-col gap-8'>

            <div className='flex flex-col gap-4 w-full p-md'>
                <div className='flex gap-4 w-full'>
                    <div className="max-w-[100%] grow w-2/5 border-[1px] border-black rounded-lg flex flex-col gap-8 p-lg ">
                        <h3>Voice Quality</h3>
                        <ul aria-label="Suggested tags" className="flex overflow-x-auto scroll-smooth whitespace-nowrap rounded-[28px] no-scrollbar">
                            <li>
                                <div className={`inline-flex items-center rounded-full border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent mr-2 cursor-pointer bg-[#FFFFFF] p-3 text-muted-foreground hover:bg-black md:bg-gray-light md:px-2.5 md:py-1 hover:text-white ${selected === "Male" ? 'bg-black text-white' : ''}`} role="button" aria-label="Add tag to prompt: prog-rock" id='Male' onClick={e => handleTagChange((e as unknown as React.ChangeEvent<HTMLDivElement>))}>Male
                                </div>
                            </li>
                            <li>
                                <div className={`inline-flex items-center rounded-full border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent mr-2 cursor-pointer bg-[#FFFFFF] p-3 text-muted-foreground hover:bg-black md:bg-gray-light md:px-2.5 md:py-1 hover:text-white ${selected === "Female" ? 'bg-black text-white' : ''}`} role="button" aria-label="Add tag to prompt: classNameic hard rock" id='Female' onClick={e => handleTagChange((e as unknown as React.ChangeEvent<HTMLDivElement>))}>Female
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div className='w-1/2 flex flex-col border-[1px] border-black rounded-lg p-md gap-4'>
                        <h3 className='text-black'>Speed</h3>
                        <input type="range" name='speed' value={musicCustomizationData.speedValue} onChange={e => handleSpeedChange(e as unknown as React.ChangeEvent<HTMLInputElement>)} />
                    </div>
                    <div className='w-1/2 flex flex-col border-[1px] border-black rounded-lg p-md gap-4'>
                        <h3 className='text-black'>Clarity</h3>
                        <input type="range" name='clarity' value={musicCustomizationData.clarityValue} onChange={e => handleClarityChange(e as unknown as React.ChangeEvent<HTMLInputElement>)} />
                    </div>
                </div>
            </div>

            <div className='flex flex-col justify-center gap-8 w-full items-center'>
                <input type="text" className='w-full h-[45px] border-2 border-black p-sm rounded-lg' value={musicCustomizationData.prompt ? musicCustomizationData.prompt : ''} onChange={handleChange} />
                <button className='border-[1px] border-black p-sm rounded-lg bg-white w-[200px] flex justify-center' onClick={handleDataSubmission}>Generate Poem</button>
                {/* <button className='bg-black text-white w-[200px] h-[60px] rounded-lg flex justify-center items-center' onClick={handleDataSubmission}>Generate</button> */}
            </div>

        </div>
    )
}

export default MusicCustomizationComponent

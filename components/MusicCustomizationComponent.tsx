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
        <div className='w-4/6 p-lg bg-slate-300 rounded-lg z-0 m-md'>

            <div className='flex flex-col gap-4 w-full p-md'>
                <div className="max-w-[100%] grow  border-[1px] border-black rounded-lg flex flex-col gap-8 p-lg w-full">
                    <h3>Background Music (Select one)</h3>
                    <ul aria-label="Suggested tags" className="flex overflow-x-auto scroll-smooth whitespace-nowrap rounded-[28px] no-scrollbar">
                        <li>
                            <div className={`inline-flex items-center rounded-full border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent mr-2 cursor-pointer bg-[#FFFFFF] p-3 text-muted-foreground hover:bg-black hover:text-white md:bg-gray-light md:px-2.5 md:py-1 ${selected === "contemporarypop" ? 'bg-black text-white' : ''}`} id='contemporarypop' role="button" aria-label="Add tag to prompt: contemporary pop/rock" onClick={e => handleTagChange((e as unknown as React.ChangeEvent<HTMLDivElement>))}>contemporary pop/rock
                            </div>
                        </li>
                        <li>
                            <div className={`inline-flex items-center rounded-full border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent mr-2 cursor-pointer bg-[#FFFFFF] p-3 text-muted-foreground hover:bg-black md:bg-gray-light hover:text-white md:px-2.5 md:py-1 ${selected === "hardrock" ? 'bg-black text-white' : ''}`} role="button" aria-label="Add tag to prompt: hard rock" onClick={e => handleTagChange((e as unknown as React.ChangeEvent<HTMLDivElement>))} id='hardrock'>hard rock
                            </div>
                        </li>
                        <li>
                            <div className={`inline-flex items-center rounded-full border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent mr-2 cursor-pointer bg-[#FFFFFF] p-3 text-muted-foreground hover:bg-black md:bg-gray-light md:px-2.5 md:py-1 hover:text-white ${selected === "poprock" ? 'bg-black text-white' : ''}`} role="button" aria-label="Add tag to prompt: pop rock" id='poprock' onClick={e => handleTagChange((e as unknown as React.ChangeEvent<HTMLDivElement>))}>pop rock
                            </div>
                        </li>
                        <li>
                            <div className={`inline-flex items-center rounded-full border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent mr-2 cursor-pointer bg-[#FFFFFF] p-3 text-muted-foreground hover:bg-black md:bg-gray-light md:px-2.5 md:py-1 hover:text-white ${selected === "drums" ? 'bg-black text-white' : ''}`} role="button" aria-label="Add tag to prompt: drums (drum set)" id='drums' onClick={e => handleTagChange((e as unknown as React.ChangeEvent<HTMLDivElement>))}>drums (drum set)
                            </div>
                        </li>
                        <li>
                            <div className={`inline-flex items-center rounded-full border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent mr-2 cursor-pointer bg-[#FFFFFF] p-3 text-muted-foreground hover:bg-black md:bg-gray-light md:px-2.5 md:py-1 hover:text-white ${selected === "bluesrock" ? 'bg-black text-white' : ''}`} role="button" aria-label="Add tag to prompt: blues rock" id='bluesrock' onClick={e => handleTagChange((e as unknown as React.ChangeEvent<HTMLDivElement>))}>Upbeat
                            </div>
                        </li>
                        <li>
                            <div className={`inline-flex items-center rounded-full border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent mr-2 cursor-pointer bg-[#FFFFFF] p-3 text-muted-foreground hover:bg-black md:bg-gray-light md:px-2.5 md:py-1 hover:text-white ${selected === "aor" ? 'bg-black text-white' : ''}`} role="button" aria-label="Add tag to prompt: aor" id='aor' onClick={e => handleTagChange((e as unknown as React.ChangeEvent<HTMLDivElement>))}>electro-swing
                            </div>
                        </li>
                        <li>
                            <div className={`inline-flex items-center rounded-full border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent mr-2 cursor-pointer bg-[#FFFFFF] p-3 text-muted-foreground hover:bg-black md:bg-gray-light md:px-2.5 md:py-1 hover:text-white ${selected === "bassguitar" ? 'bg-black text-white' : ''}`} role="button" aria-label="Add tag to prompt: bass guitar" id='bassguitar' onClick={e => handleTagChange((e as unknown as React.ChangeEvent<HTMLDivElement>))}>bass guitar
                            </div>
                        </li>
                        <li>
                            <div className={`inline-flex items-center rounded-full border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent mr-2 cursor-pointer bg-[#FFFFFF] p-3 text-muted-foreground hover:bg-black md:bg-gray-light md:px-2.5 md:py-1 hover:text-white ${selected === "rock" ? 'bg-black text-white' : ''}`} role="button" aria-label="Add tag to prompt: rock" id='rock' onClick={e => handleTagChange((e as unknown as React.ChangeEvent<HTMLDivElement>))}>rock
                            </div>
                        </li>
                        <li>
                            <div className={`inline-flex items-center rounded-full border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent mr-2 cursor-pointer bg-[#FFFFFF] p-3 text-muted-foreground hover:bg-black md:bg-gray-light md:px-2.5 md:py-1 hover:text-white ${selected === "hardrock" ? 'bg-black text-white' : ''}`} role="button" aria-label="Add tag to prompt: guitar" onClick={e => handleTagChange((e as unknown as React.ChangeEvent<HTMLDivElement>))}>guitar
                            </div>
                        </li>
                        <li>
                            <div className={`inline-flex items-center rounded-full border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent mr-2 cursor-pointer bg-[#FFFFFF] p-3 text-muted-foreground hover:bg-black md:bg-gray-light md:px-2.5 md:py-1 hover:text-white ${selected === "softrock" ? 'bg-black text-white' : ''}`} role="button" aria-label="Add tag to prompt: soft rock" id='softrock' onClick={e => handleTagChange((e as unknown as React.ChangeEvent<HTMLDivElement>))}>soft rock
                            </div>
                        </li>
                        <li>
                            <div className={`inline-flex items-center rounded-full border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent mr-2 cursor-pointer bg-[#FFFFFF] p-3 text-muted-foreground hover:bg-black md:bg-gray-light md:px-2.5 md:py-1 hover:text-white ${selected === "pop-metal" ? 'bg-black text-white' : ''}`} role="button" aria-label="Add tag to prompt: pop-metal" id='pop-metal' onClick={e => handleTagChange((e as unknown as React.ChangeEvent<HTMLDivElement>))}>pop-metal
                            </div>
                        </li>
                        <li>
                            <div className={`inline-flex items-center rounded-full border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent mr-2 cursor-pointer bg-[#FFFFFF] p-3 text-muted-foreground hover:bg-black md:bg-gray-light md:px-2.5 md:py-1 hover:text-white ${selected === "pop" ? 'bg-black text-white' : ''}`} role="button" aria-label="Add tag to prompt: pop" id='pop' onClick={e => handleTagChange((e as unknown as React.ChangeEvent<HTMLDivElement>))}>pop
                            </div>
                        </li>
                        <li>
                            <div className={`inline-flex items-center rounded-full border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent mr-2 cursor-pointer bg-[#FFFFFF] p-3 text-muted-foreground hover:bg-black md:bg-gray-light md:px-2.5 md:py-1 hover:text-white ${selected === "rockballad" ? 'bg-black text-white' : ''}`} role="button" aria-label="Add tag to prompt: rock ballad" id='rockballad' onClick={e => handleTagChange((e as unknown as React.ChangeEvent<HTMLDivElement>))}>rock ballad
                            </div>
                        </li>
                        <li>
                            <div className={`inline-flex items-center rounded-full border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent mr-2 cursor-pointer bg-[#FFFFFF] p-3 text-muted-foreground hover:bg-black md:bg-gray-light md:px-2.5 md:py-1 hover:text-white ${selected === "rockandroll" ? 'bg-black text-white' : ''}`} role="button" aria-label="Add tag to prompt: rock and roll" id='rockandroll' onClick={e => handleTagChange((e as unknown as React.ChangeEvent<HTMLDivElement>))}>rock and roll
                            </div>
                        </li>
                        <li>
                            <div className={`inline-flex items-center rounded-full border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent mr-2 cursor-pointer bg-[#FFFFFF] p-3 text-muted-foreground hover:bg-black md:bg-gray-light md:px-2.5 md:py-1 hover:text-white clicked:active ${selected === "electricguitar" ? 'bg-black text-white' : ''}`} role="button" id='electricguitar' aria-label="Add tag to prompt: electric guitar" onClick={e => handleTagChange((e as unknown as React.ChangeEvent<HTMLDivElement>))}>electric guitar
                            </div>
                        </li>
                        <li>
                            <div className={`inline-flex items-center rounded-full border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent mr-2 cursor-pointer bg-[#FFFFFF] p-3 text-muted-foreground hover:bg-black md:bg-gray-light md:px-2.5 md:py-1 hover:text-white ${selected === "prog-rock" ? 'bg-black text-white' : ''}`} role="button" aria-label="Add tag to prompt: prog-rock" id='prog-rock' onClick={e => handleTagChange((e as unknown as React.ChangeEvent<HTMLDivElement>))}>prog-rock
                            </div>
                        </li>
                        <li>
                            <div className={`inline-flex items-center rounded-full border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent mr-2 cursor-pointer bg-[#FFFFFF] p-3 text-muted-foreground hover:bg-black md:bg-gray-light md:px-2.5 md:py-1 hover:text-white ${selected === "classnameicrock" ? 'bg-black text-white' : ''}`} role="button" aria-label="Add tag to prompt: classNameic hard rock" id='classnameicrock' onClick={e => handleTagChange((e as unknown as React.ChangeEvent<HTMLDivElement>))}>acoustic
                            </div>
                        </li>
                    </ul>
                </div>

                <div className='flex gap-4 w-full'>
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

            <div className='flex justify-center gap-2 w-full'>
                <input type="text" className='w-3/4 h-[45px] border-2 border-black p-sm rounded-lg' value={musicCustomizationData.prompt ? musicCustomizationData.prompt : ''} onChange={handleChange} />
                <button className='border-[1px] border-black p-sm rounded-lg bg-white' onClick={handleDataSubmission}>Generate Music</button>
                {/* <button className='bg-black text-white w-[200px] h-[60px] rounded-lg flex justify-center items-center' onClick={handleDataSubmission}>Generate</button> */}
            </div>

        </div>
    )
}

export default MusicCustomizationComponent

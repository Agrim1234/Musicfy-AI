import React from 'react'
import Image from 'next/image'


type musicTrackCardProps = {
    song: Song,
}


const MusicTrackCardComponent = ({ song }: musicTrackCardProps) => {


    console.log(song);

    return (

        <div>

            <div className="relative flex justify-between overflow-hidden border border-transparent bg-inherit transition-colors" ><span className="absolute right-2 top-2"></span>
                <div className="my-[6px] ml-1 grid w-1/2">
                    <div className="flex items-center"><button className="rounded relative mt-1 h-[56px] w-[56px] flex-shrink-0 select-none sm:mt-0 sm:block cursor-pointer" title="Play track">
                        <Image alt="Tropical Balance" loading="lazy" width="56" height="56" decoding="async" data-nimg="1" className="rounded object-cover transition-all duration-500 hover:scale-105 aspect-square" sizes="56px" src={song.imageUrl ? song.imageUrl : '/apple.svg'} />
                        <div className="hidden md:flex">
                            <div className="absolute inset-0 flex cursor-pointer select-none items-center justify-center bg-black opacity-0 transition-opacity focus-within:opacity-65 hover:opacity-65" role="button">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke=" white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play size-[45px]" ><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                            </div>
                        </div></button>
                        <div className="mx-4 flex select-none flex-col items-start justify-center text-xs sm:text-base w-[232px]">
                            <div className="flex flex-col justify-center space-x-2 self-stretch"><a className="flex items-center cursor-pointer hover:underline" role="button" aria-description="open track details preview" href='#'>
                                <div className="flex min-w-0 items-center"><a data-state="closed"><h4 className="truncate-2-lines mr-2 text-base font-medium">{song.name}</h4></a>
                                </div></a>
                            </div>
                            <div className="flex max-w-full">
                                <div className="flex items-center justify-start text-xs font-normal">

                                </div>
                                <div className="flex items-center space-x-1 overflow-hidden whitespace-nowrap text-xs font-normal text-muted-foreground -translate-x-[4px]">
                                    {song.tags && song.tags?.length !== 0 && song.tags.map(
                                        (tag) => <div key={tag}>
                                            <a className="rounded-full p-1 hover:bg-[#1B1B1B] hover:text-white" href={`/tags/${tag}`}>{tag}</a><span className="px-0.5">•</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-1 gap-1 self-stretch text-sm font-medium text-muted-foreground md:items-center">
                                <div className="flex flex-1 flex-col">
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-heart ml-4 mr-1 h-4 w-4 md:ml-3 md:h-3 md:w-3 fill-none text-foreground"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>{song.likes}
                                        <div className="ml-2 text-sm text-muted-foreground">{song.duration}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center sm:m-3">
                    <div className="hidden items-center sm:flex absolute right-10">
                    </div><button className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground rounded-md py-2 h-4 px-1 sm:ml-1 sm:h-10 md:block absolute right-1" type="button" id="radix-:r7v:" aria-haspopup="menu" aria-expanded="false" data-state="closed">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-more-horizontal "><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg></button>
                    <div>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default MusicTrackCardComponent

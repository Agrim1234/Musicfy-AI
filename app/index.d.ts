interface Song {
    name?: string | 'user song';
    author?: string |  'user';
    imageUrl: string | undefined;
    srcUrl: string;
    tags?: string[] | null;
    likes: number | 0;
    duration: string | '0:0';
}

interface comedyShowVideo {
    name?: string | 'user comedy show';
    author?: string |  'user';
    imageUrl: string | undefined;
    srcUrl: string;
    tags?: string[] | null;
    likes: number | 0;
    duration: string | '0:0';
}

declare module 'gtts';
import { NextResponse } from 'next/server';
import * as Tone from 'tone';
import gtts from 'gtts';
import path from 'path';
// const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
// import ffmpeg from 'fluent-ffmpeg';
//ffmpeg.setFfmpegPath(ffmpegPath);
import { exec } from 'child_process';

export const POST = async (req) => {
  const { promptMusicGeneration } = await req.json();
  
  console.log(promptMusicGeneration)
  //console.log(ffmpegPath.path)

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

  // console.log(noteSequence)

  if (!promptMusicGeneration) {
    return NextResponse.json({ error: 'promptMusicGeneration query parameter is required' });
  }

  const speech = new gtts(promptMusicGeneration, 'en');
  //console.log(speech)
  const filePath = path.join(process.cwd(), 'public', 'speech.mp3');
  console.log(filePath)
  const backgroundPath = '/child-audio.mp3'
  const overlayPath = '/speech.mp3'
  const outputPath = '/output.mp3'

  speech.save(filePath, function (err) {
    if (err) {
      return NextResponse.json({ error: 'Failed to generate speech' });
    }


    exec('ffmpeg -i public/speech.mp3 -i public/child-audio.mp3 -filter_complex "amix=inputs=2:duration=first" public/output.mp3', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
        return;
      }
      console.log(`Stdout: ${stdout}`);
    });

    return NextResponse.json({ file: outputPath });
  });

  return NextResponse.json({ file: outputPath });

}
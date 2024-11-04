import express from 'express';
import multer from 'multer';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import cors from "cors";
const app = express();
app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
// Set up file upload handling
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });
// Route to trim audio
app.post('/trim', upload.single('audio'), (req, res) => {
    var _a;
    const { start, end } = req.body;
    console.log("values from req body: ", start, end);
    const inputPath = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
    console.log("file on request object: ", req.file);
    console.log("input path: ", inputPath);
    const outputPath = `uploads/trimmed-${Date.now()}.mp3`;
    ffmpeg(inputPath)
        .setStartTime(start)
        .setDuration(end - start)
        .output(outputPath)
        .on('end', () => res.download(outputPath, () => fs.unlinkSync(outputPath)))
        .on('error', (err) => res.status(500).send('Audio processing error: ' + err.message))
        .run();
});
// Route to adjust volume
app.post('/adjust-volume', upload.single('audio'), (req, res) => {
    var _a;
    const { volume } = req.body;
    const inputPath = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
    const outputPath = `uploads/volume-adjusted-${Date.now()}.mp3`;
    ffmpeg(inputPath)
        .audioFilters(`volume=${volume}`)
        .output(outputPath)
        .on('end', () => res.download(outputPath, () => fs.unlinkSync(outputPath)))
        .on('error', (err) => res.status(500).send('Audio processing error: ' + err.message))
        .run();
});
// Start the server
app.listen(5000, () => console.log('Server running on port 5000'));

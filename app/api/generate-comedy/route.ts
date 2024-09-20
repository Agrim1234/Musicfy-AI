import { NextResponse } from 'next/server';
import OpenAi from "openai"
import { Builder, By, Key, until } from 'selenium-webdriver'
import axios from 'axios';
import fs from 'fs';
import gtts from 'gtts';
import path from 'path';
import { exec } from 'child_process';
import chrome, { ServiceBuilder } from 'selenium-webdriver/chrome';

type automateVideoGenerationProps = {
    imgUrl: string,
    videoUrl: string,
    prompt: string,
}

type downloadImageProps = {
    filename: string,
    imgUrl: string
}

type mergeAudioAndVideoProps = {
    audioFile: string,
    videoFile: string,
    outputFile: string
}

type textToSpeechProps = {
    text: string,
    outputFile: string
}


async function textToSpeech({ text, outputFile }: textToSpeechProps) {

    const speech = new gtts(text, 'en');
    try {
        await new Promise((resolve, reject) => {
            speech.save(outputFile, (err: any) => {
                if (err) {
                    console.error(err);
                    reject(err);
                }
                console.log('successfully completed');
                resolve(outputFile)
            })
        })
    } catch (error) {
        console.error('Error:', error);
    }

}

async function downloadImage({ imgUrl, filename }: downloadImageProps) {
    const filePath = path.resolve(process.cwd(), filename);
    const writer = fs.createWriteStream(filePath);

    const response = await axios({
        url: imgUrl,
        method: 'GET',
        responseType: 'stream'
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}


async function mergeAudioAndVideo({ audioFile, videoFile, outputFile }: mergeAudioAndVideoProps) {

    const videoCommand = "ffmpeg -i " + videoFile + " -i " + audioFile + " -c:v copy -c:a aac -strict experimental " + outputFile + "";
    await new Promise((resolve, reject) => {
        exec(videoCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                reject(error)
                return;
            }
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
            resolve(outputFile);
        });
    })

}


async function automateRunwayML({ imgUrl,videoUrl, prompt }: automateVideoGenerationProps) {

    // Initialize the WebDriver
    const downloadFilepath = path.resolve(process.cwd(), 'public/');
    const chromedriverPath = path.resolve(process.cwd(), 'node_modules', 'chromedriver', 'bin', 'chromedriver');
    const options = new chrome.Options();
    options.setUserPreferences({
        'download.default_directory': downloadFilepath,
        'download.prompt_for_download': false,
        'download.directory_upgrade': true,
        'safebrowsing.enabled': true
    });
    let driver = await new Builder().forBrowser('chrome').setChromeService(new ServiceBuilder(chromedriverPath)).setChromeOptions(options).build();



    try {
        driver.manage().setTimeouts({ implicit: 50000 })
        // Navigate to Runway ML's login page   
        await driver.get('https://app.runwayml.com/login');

        // Log in to your Runway ML account
        if (process.env.RUNWAY_ML_USERNAME && process.env.RUNWAY_ML_PASSWORD) {
            await driver.findElement(By.xpath('//*[@id="root"]/div/div[4]/div[1]/div/div[2]/div/div[2]/div/form/div[1]/input[1]')).sendKeys(process.env.RUNWAY_ML_USERNAME);
            await driver.findElement(By.xpath('//*[@id="root"]/div/div[4]/div[1]/div/div[2]/div/div[2]/div/form/div[1]/input[2]')).sendKeys(process.env.RUNWAY_ML_PASSWORD, Key.RETURN);
        }
        console.log('logged in');

        await driver.wait(until.urlContains('/dashboard'), 20000);

        await driver.get('https://app.runwayml.com/video-tools/teams/persistdomains/ai-tools/generative-video'); // Replace with the actual URL

        await driver.sleep(3000);
        // await driver.wait(until.elementLocated(By.css('button.BaseModelSelector__TriggerStyled-sc-1ed3w6f-0.OSTyQ')), 20000);

        await driver.sleep(3000);


        // const returnElement = await driver.findElement(By.xpath('//*[@id="magic-tool-main-container"]/div/div/div[3]/div/div[2]/div/div'));
        // const valueReturn = await returnElement.click();
        // console.log(valueReturn)
        // console.log('return button clicked');

        await driver.sleep(3000);

        await driver.sleep(3000);
        const fileInput = await driver.findElement(By.xpath('//*[@id="data-panel-id-left-panel-panel-top"]/div/div[2]/div'));
        const filePath = path.resolve(process.cwd(), imgUrl); 
        console.log(filePath)
        console.log(fileInput)

        await driver.sleep(3000);
        const imageData = fs.readFileSync(filePath, 'base64');

        const jsScript = `
            const target = arguments[0];
            const imageBase64 = arguments[1];
            const fileName = arguments[2];

            const byteCharacters = atob(imageBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/jpeg' });
            const file = new File([blob], fileName, { type: 'image/jpeg' });

            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);

            const dropEvent = new DragEvent('drop', {
                dataTransfer,
                bubbles: true,
                cancelable: true,
            });

            target.dispatchEvent(dropEvent);
        `;

        await driver.executeScript(jsScript, fileInput, imageData, path.basename(filePath));
        console.log('image uploaded')

        await driver.wait(until.elementLocated(By.xpath('//*[@id="magic-tool-main-container"]/div/div/div[3]/div/div[1]/div/main/div')), 25000);
        console.log('image loading complete')

        await driver.wait(until.elementIsEnabled(driver.findElement(By.css('div.advanced-cropper-fade--visible'))))
        await driver.wait(until.elementIsEnabled(driver.findElement(By.css('button.Button-sc-c1bth8-0.Button__StyledButton-sc-c1bth8-1.kjAqmU'))));
        const cropElement = await driver.findElement(By.css('button.Button-sc-c1bth8-0.Button__StyledButton-sc-c1bth8-1.kjAqmU'));

        console.log(cropElement)
        await driver.wait(until.elementIsVisible(cropElement), 10000);
        await driver.wait(until.elementIsEnabled(cropElement), 10000);

        await driver.executeScript("arguments[0].scrollIntoView(true);", cropElement); // Scroll into view if needed

        await driver.sleep(1000);

        const value = await driver.executeScript("arguments[0].click();", cropElement);
        console.log(cropElement)
        console.log(value)

        console.log('crop element clicked')

        await driver.wait(until.elementIsVisible(driver.findElement(By.xpath('//*[@id="data-panel-id-left-panel-panel-bottom" and not(@disabled)]/div/div/div/div/div[1]'))), 30000);
        await driver.wait(until.elementLocated(By.xpath('//*[@id="data-panel-id-left-panel-panel-bottom" and not(@disabled)]/div/div/div/div/div[1]')), 20000);
        console.log('cropping complete');

        await driver.findElement(By.xpath('//*[@id="data-panel-id-left-panel-panel-bottom" and not(@disabled)]/div/div/div/div/div[1]')).sendKeys(`Visual: ${prompt} Camera motion: camera fixed at one position`);
        console.log('text prompt entered');

        const durationElement = await driver.findElement(By.css('button.EuropaDurationButton__Button-sc-8nhilp-1'));
        await durationElement.click();
        await driver.sleep(2000)
        const fivesecElement = await driver.findElement(By.xpath('//div[text() = "5 seconds"]'));  
        await driver.sleep(2000)
        await fivesecElement.click();
        
        const videogenElement = await driver.findElement(By.xpath('//*[@id="magic-tool-main-container"]/div/div/div[3]/div/div[1]/div/div/div/div/div[2]/div[2]/div/div/button'));
        await videogenElement.click();
        console.log('video geeratoin started')

        await driver.sleep(60000)
       
        await driver.sleep(2000)

        const sideBar = await driver.findElement(By.css('div.Base__Box-sc-1rhgz1n-0.HeaderDropdown___StyledBox-sc-16in36a-0.lfBlZw'))
        await driver.sleep(2000)
        await sideBar.click();
        await driver.sleep(2000)


        const assetsBtn = await driver.findElement(By.xpath('//p[text() = "Open Assets"]'));
        await driver.sleep(2000)
        await assetsBtn.click();
        await driver.sleep(3000)


      
        const assetElement = await driver.findElement(By.xpath('//div[@class = "index__assets__FOFM5"]//child::div[1]'));
        await driver.sleep(1000);

        const actions = driver.actions({ async: true });
        await actions.contextClick(assetElement).perform();
        await driver.sleep(1000);

        const renameElement = await driver.findElement(By.xpath('//div[text() = "Rename"]'));
        await driver.sleep(1000);
        await renameElement.click();
        await driver.sleep(1000);
        
        
        const renameInput = await driver.findElement(By.css('input.RenameAssetDialog__input__caHlX'));
        await driver.sleep(1000);
        await renameInput.clear();
        await driver.sleep(1000);
        await renameInput.sendKeys(videoUrl);
        await driver.sleep(1000);


        const submitBtn = await driver.findElement(By.xpath('//button[text()="Rename"]'))
        await driver.sleep(1000);
        await submitBtn.click();
        await driver.sleep(1000);

        await actions.contextClick(assetElement).perform();
        await driver.sleep(1000);

        const downloadElement = await driver.findElement(By.xpath('//div[text() = "Download"]'));
        await driver.sleep(1000);
        await downloadElement.click();

        await driver.sleep(30000);

        console.log('Video generation complete.');


    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        await driver.quit();
        console.log('WebDriver session closed');
    }
}



export const POST = async (req: Request) => {
    const openai = new OpenAi({ apiKey: process.env.OPENAI_API_KEY });

    const { prompt, elementId } = await req.json();

    console.log(prompt)

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        temperature: 0,
        max_tokens: 200,
        n: 1,
        messages: [
            { role: "system", content: "Respond only with short comedy stories of 90 to 100 words with subject himself speaking the story" },
            { role: "user", content: prompt }
        ]
    });

    
    let responseText = '';

    if (response.choices && response.choices.length > 0) {
        responseText = response.choices[0].message.content || '';
    }


    await textToSpeech({ text: responseText, outputFile: `public/${elementId}_outputAudio.mp3` });
    console.log('text to speech converted successfully')


    const responseImage = await openai.images.generate({
        model: "dall-e-3",
        prompt: responseText,
        n: 1,
        size: "1024x1024",
    });


    const image_url = responseImage.data[0].url;
    console.log(image_url);
    const outputPath = `public/${elementId}_outputImage.webp`

    if (image_url) {
        const value = await downloadImage({ imgUrl: image_url, filename: outputPath });
        console.log(value)
        console.log('image downloaded successfully')


        await automateRunwayML({ imgUrl: outputPath, videoUrl: `${elementId}_outputVideo.mp4`, prompt: responseText })
        console.log('video downloaded successfully')


        await mergeAudioAndVideo({ audioFile: `public/${elementId}_outputAudio.mp3`, videoFile: `public/${elementId}_outputVideo.mp4`, outputFile: `public/${elementId}_outputFinal.mp4` })

    }

    return NextResponse.json({ file: `/${elementId}_outputFinal.mp4`, value: responseText, imageUrl: image_url, duration: '0:0' });
}



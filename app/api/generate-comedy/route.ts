import React from 'react'
import { NextResponse } from 'next/server';
import Anthropic from "@anthropic-ai/sdk";
import OpenAi from "openai"
import { Builder, By, Key, until } from 'selenium-webdriver'
import axios from 'axios';
import fs from 'fs';
import gtts from 'gtts';
import path from 'path';
import { exec } from 'child_process';
import chrome, { ServiceBuilder } from 'selenium-webdriver/chrome';
import chromedriver from 'chromedriver'

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

    // Create a video using the generated text
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

        // Wait until the user is logged in and redirected to the dashboard
        await driver.wait(until.urlContains('/dashboard'), 20000);

        // Navigate to the video generation tool or project
        await driver.get('https://app.runwayml.com/video-tools/teams/persistdomains/ai-tools/generative-video'); // Replace with the actual URL

        // Interact with the UI elements to configure the video generation
        await driver.wait(until.elementLocated(By.xpath('//*[@id="radix-1"]')), 20000);

        //*[@id="radix-4"]
        // await driver.findElement(By.xpath('//*[@id="radix-1"]')).click();
        // console.log('model chosen successfully')

        // await driver.wait(until.elementLocated(By.xpath('/html/body/div[7]')), 2000)
        // console.log('dropdown appears')

        // await driver.findElement(By.xpath('//*[@id="radix-4"]/div[2]')).click();
        // console.log('model button assigned')    

        const returnElement = await driver.findElement(By.xpath('//*[@id="magic-tool-main-container"]/div/div/div[3]/div/div[2]/div/div'));
        const valueReturn = await returnElement.click();
        console.log(valueReturn)
        console.log('return button clicked');

        //upload the image
        const fileInput = await driver.findElement(By.xpath('//*[@id="data-panel-id-left-panel-panel-top"]/div/div[2]/div'));
        const filePath = path.resolve(process.cwd(), imgUrl); // Replace with your image file path
        console.log(filePath)
        console.log(fileInput)
        // await fileInput.sendKeys(filePath);

        // Verify that the file exists
        //  if (!fs.existsSync(filePath)) {
        //     throw new Error('Image file not found: ' + filePath);
        // }

        // Use JavaScript to simulate the drag-and-drop action


        // Read the image file and convert it to a Base64 string 

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

        // Execute the script to drop the image
        await driver.executeScript(jsScript, fileInput, imageData, path.basename(filePath));
        console.log('image uploaded')



        // Wait for the image to load
        await driver.wait(until.elementLocated(By.xpath('//*[@id="magic-tool-main-container"]/div/div/div[3]/div/div[1]/div/main/div')), 25000);
        console.log('image loading complete')


        //Click on crop button and wait
        await driver.wait(until.elementIsEnabled(driver.findElement(By.css('div.Wrapper-module__fade__D0g3g.advanced-cropper-fade.advanced-cropper-fade--visible'))))
        await driver.wait(until.elementIsEnabled(driver.findElement(By.css('button.Button-sc-c1bth8-0.Button__StyledButton-sc-c1bth8-1.kjAqmU.ImagePromptEditorPanel__PrimaryButtonStyled-sc-13f4vw2-0.bHEvyM'))));
        const cropElement = await driver.findElement(By.css('button.Button-sc-c1bth8-0.Button__StyledButton-sc-c1bth8-1.kjAqmU.ImagePromptEditorPanel__PrimaryButtonStyled-sc-13f4vw2-0.bHEvyM'));
        //*[@id="magic-tool-main-container"]/div/div/div[3]/div/div[1]/div/main/footer/button[2]
        //*[@id="data-panel-id-17"]/div[1]/main/footer/button[2]
        //*[@id="data-panel-id-25"]/div[1]/main/footer/button[2]
        // <button class="Button-sc-c1bth8-0 Button__StyledButton-sc-c1bth8-1 kjAqmU ImagePromptEditorPanel__PrimaryButtonStyled-sc-13f4vw2-0 bHEvyM" data-loading="false"><span class="Button__ButtonChildrenOrLoaderContainer-sc-c1bth8-2 jjxCJk"><span class="Button__ChildrenContainer-sc-c1bth8-3 hNuuCC">Crop</span></span></button>
        // <button class="Button-sc-c1bth8-0 Button__StyledButton-sc-c1bth8-1 kjAqmU ImagePromptEditorPanel__PrimaryButtonStyled-sc-13f4vw2-0 bHEvyM" data-loading="false"><span class="Button__ButtonChildrenOrLoaderContainer-sc-c1bth8-2 jjxCJk"><span class="Button__ChildrenContainer-sc-c1bth8-3 hNuuCC">Crop</span></span></button>
        //*[@id="data-panel-id-29"]/div[1]/main/footer/button[2]
        // /html/body/div[1]/div/div[3]/div[1]/div/div/div/div[3]/div/div/div[1]/div[1]/main/footer/button[2]
        // /html/body/div[1]/div/div[3]/div[1]/div/div/div/div[3]/div/div[1]/div/main/footer/button[2]
        //*[@id="magic-tool-main-container"]/div/div/div[3]/div/div[1]/div/main/footer/button[2]
        //*[@id="data-panel-id-77"]/div[1]/main/footer/button[2]
        //*[@id="data-panel-id-81"]/div[1]/main/footer/button[2]
        //#data-panel-id-19 > div.LeftPanel-module__layout__9WgYI > main > footer > button.Button-sc-c1bth8-0.Button__StyledButton-sc-c1bth8-1.kjAqmU.ImagePromptEditorPanel__PrimaryButtonStyled-sc-13f4vw2-0.bHEvyM
        // <button class="Button-sc-c1bth8-0 Button__StyledButton-sc-c1bth8-1 kjAqmU ImagePromptEditorPanel__PrimaryButtonStyled-sc-13f4vw2-0 bHEvyM" data-loading="false"><span class="Button__ButtonChildrenOrLoaderContainer-sc-c1bth8-2 jjxCJk"><span class="Button__ChildrenContainer-sc-c1bth8-3 hNuuCC">Crop</span></span></button>

        console.log(cropElement)
        await driver.wait(until.elementIsVisible(cropElement), 10000);
        await driver.wait(until.elementIsEnabled(cropElement), 10000);

        await driver.executeScript("arguments[0].scrollIntoView(true);", cropElement); // Scroll into view if needed

        const rect = await cropElement.getRect(); // Check if the element is within the viewport
        console.log('Element Rect:', rect);

        await driver.sleep(1000);

        const isOverlapping = await driver.executeScript(`
            const elem = arguments[0];
            const rect = elem.getBoundingClientRect();
            return document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2) !== elem;
        `, cropElement);

        console.log('Is Overlapping:', isOverlapping);


        //*[@id="radix-4"]
        // const modelElementButton = await driver.findElement(By.xpath('//*[@id="radix-4"]'));
        // await driver.wait(until.elementIsVisible(modelElementButton));
        // await driver.wait(until.elementIsEnabled(modelElementButton));
        // await modelElementButton.click();
        // await modelElementButton.click();

        //console.log(cropElement)

        

        const value = await driver.executeScript("arguments[0].click();", cropElement);
        console.log(cropElement)
        console.log(value)

        console.log('crop element clicked')



        // Wait for cropping to complete and return to original window
        await driver.wait(until.elementIsVisible(driver.findElement(By.xpath('//*[@id="data-panel-id-left-panel-panel-bottom" and not(@disabled)]/div/div/div/div/div[1]'))), 30000);
        await driver.wait(until.elementLocated(By.xpath('//*[@id="data-panel-id-left-panel-panel-bottom" and not(@disabled)]/div/div/div/div/div[1]')), 20000);
        console.log('cropping complete');



        // Optionally, fill out any forms or select options        
        await driver.findElement(By.xpath('//*[@id="data-panel-id-left-panel-panel-bottom" and not(@disabled)]/div/div/div/div/div[1]')).sendKeys(`Visual: ${prompt} Camera motion: camera fixed at one position`);
        console.log('text prompt entered');



        //select the 5s option -
        const durationElement = await driver.findElement(By.css('button.EuropaDurationButton__Button-sc-1ehwadc-0.ckSFxu'));
        await durationElement.click();
        await driver.sleep(2000)
        const fivesecElement = await driver.findElement(By.xpath('//div[text() = "5 seconds"]'));  
        await driver.sleep(2000)
        await fivesecElement.click();
        //*[@id="radix-7"]/div[1]
        


        // Start the video generation process
        const videogenElement = await driver.findElement(By.xpath('//*[@id="magic-tool-main-container"]/div/div/div[3]/div/div[1]/div/div/div/div/div[2]/div[2]/div/div/button'));
        await videogenElement.click();
        console.log('video geeratoin started')


        // Wait for the video generation to complete (you may need to increase this timeout)
        //await driver.wait(until.elementIsVisible(driver.findElement(By.xpath('//*[@id="gen2-next-layout-feed-container"]/div[1]/div/div[2]/div[2]/div[1]/button'))));
        await driver.sleep(60000)
        // const videoElement = await driver.findElement(By.xpath('//*[@id="gen2-next-layout-feed-container"]/div[1]/div/div[2]/div[2]/div[1]/button'));
        // await videoElement.click();


        //select download option
        //const videoDownloadElement = await driver.wait(until.elementLocated(By.xpath('//*[@id="data-panel-id-editor"]/div/div/div')), 50000);
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

        //await videoDownloadElement.click();
        //await driver.findElement(By.xpath('//*[@id="gen2-next-layout-feed-container"]/div[1]/div/div[1]/div[2]/div/div[3]/button[1]')).click();
        console.log('Video generation complete.');


    } catch (error) {
        console.error('An error occurred:', error);
    } finally {

        // Quit the WebDriver session
        await driver.quit();
        console.log('WebDriver session closed');

    }
}



export const POST = async (req: Request) => {
    //const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
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



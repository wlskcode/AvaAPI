const puppeteer = require("puppeteer");
const express = require("express");
const config = require("./config")
const app = express();
const port = process.env.PORT || 8080;
let ws;

app.use(express.json());
//let url = 'https://www.instagram.com/p/CRxcY6tB0_y/'  https://www.instagram.com/p/CQEUKNtN3Nb/
app.listen(port, () => console.log(`Listening at http://localhost:${port}`));

app.get('/api', async (req, res) => {
    const {url} = req.query;
    console.log(req.params);
    const result = await InstaDl(url, ws);
    res.status(200).send({
        url_list: result,
        posts: result.length
    })
})

puppeteer.launch(config).then(browser => {
    const wsEndpoint = browser.wsEndpoint()
    ws = wsEndpoint
})

const InstaDl = async (url, ws) => {
    console.log(ws);
    try{
        const browser = await puppeteer.connect({browserWSEndpoint: ws}).catch(err => console.log(err))

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148')
        const downloadUrl = 'https://instaoffline.net/carousel-downloader/?q=' + url;
        console.log(downloadUrl)
        await page.goto(downloadUrl, { waitUntil: 'networkidle0' });
        
        const data = await page.evaluate(() => Array.from(document.querySelectorAll('a[class="button"]'), e => e.href));

        let hrefGot = [];
        data.forEach(elem => {
            const noDownload = elem.substring(0, elem.length - 5); //Removes auto download
            if (!hrefGot.includes(noDownload)) hrefGot.push(noDownload);
        })
        console.log(hrefGot);
        page.close();
        return hrefGot;
    }catch (err){
        console.log(err);
    }
}
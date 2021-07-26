const puppeteer = require("puppeteer");
const express = require("express");
const config = require("./config")
const app = express();
const port = 8080;

app.use(express.json());
//let url = 'https://www.instagram.com/p/CRxcY6tB0_y/'
app.listen(process.env.PORT || port, () => console.log(`Listening at http://localhost:${port}`));

app.get('/url', async (req, res) => {
    const {post} = req.body;
    console.log('Request Type:', req.method);
    const result = await InstaDl(post)
    res.status(200).send({
        url_list: result
    })

})
const InstaDl = async (url) => {

    const browser = await puppeteer.launch(config);

    const page = await browser.newPage();
    const downloadUrl = 'https://instaoffline.net/carousel-downloader/?q=' + url;
    console.log(downloadUrl)
    await page.goto(downloadUrl);
    await page.waitForXPath('//*[@id="slick-slide00"]/div/div/a'); //domcontentloaded
    

    const data = await page.evaluate(() => Array.from(document.querySelectorAll('a[tabindex="-1"]'), e => e.href));

    let hrefGot = [];
    data.forEach(elem => {
        const noDownload = elem.substring(0, elem.length - 5); //Removes auto download
        if (!hrefGot.includes(noDownload)) hrefGot.push(noDownload);
    })
    console.log(hrefGot);
    await browser.close();
    return hrefGot;
}

/* class InstaScraper {
    async launch() {
        this.browser = await puppeteer.launch(options);
    }
    
    async goto(site) {
        const page = await this.browser.newPage();
        await page.goto(site);
        await page.waitForXPath('//*[@id="slick-slide00"]/div/div/a');
        const data = await page.evaluate(() => Array.from(document.querySelectorAll('a[tabindex="-1"]'), e => e.href));
        let hrefGot = [];
        data.forEach(elem => {
            const noDownload = elem.substring(0, elem.length - 5); //Removes auto download
            if (!hrefGot.includes(noDownload)) hrefGot.push(noDownload);
        })
        await page.close();
        return hrefGot;
    }
    
    async close() {
        await this.browser.close();
    }
    }

(async () => {
    const scraper = new InstaScraper();
    await scraper.launch();
  

    app.get('/url', async (req, res) => {
        const {post} = req.body;
        const downloadUrl = 'https://instaoffline.net/carousel-downloader/?q=' + post;
        console.log(post)
        const result = await scraper.goto(downloadUrl)

        res.status(200).send({
            url_list: result
        })

})
}) */


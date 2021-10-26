const puppeteer = require('puppeteer-core');
const auth = require('./static/js/auth');
const fs = require('fs');
const util = require('util');
var log_file_err = fs.createWriteStream(__dirname + '/error.log', { flags: 'a' });
process.on('uncaughtException', function(err) {
    console.log('Caught exception: ' + err);
    log_file_err.write(util.format('Caught exception: ' + err) + '\n');
});

(async() => {
    const browser = await puppeteer.launch({
        executablePath: "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
        headless: true
    });
    const page = await browser.newPage();
    await page.goto('https://mailbox.gamer.com.tw/');
    await page.type('#form-login > input:nth-child(1)', auth.user());
    await page.type('#form-login > div.password-box > input', auth.password());
    await page.click('#btn-login');
    await page.waitForNavigation();
    //await page.screenshot({ path: 'mailbox.png' });

    async function mailDelFn() {
        try {
            await page.waitForSelector('.readU', { timeout: 500 });
        } catch (error) {
            await browser.close();
        }
        const count = await page.evaluate(async() => {
            let count = 0;
            const otbody = document.querySelector('#delFrm > table > tbody');
            const omails = otbody.querySelectorAll('.readU');
            if (!omails.length) return omails.length;
            for (let i = 0; i < omails.length; i++) {
                let user = await omails[i].querySelector('td.ML-tb1B > p > span > a.searchUser').innerText;
                let name = await omails[i].querySelector('td.ML-tb1B > p > span > a:nth-child(2)').innerText;
                let title = await omails[i].querySelector('td:nth-child(3) > p > a').innerText;
                let ocheckbox = await omails[i].querySelector('td:nth-child(1) > input[type=checkbox]');
                if (user != "sysop") continue;
                if (!["系統通知", "sysop"].some(str => str === name)) continue;
                if (!["【勇者福利社】成功獲得抽獎資格通知信", "動畫瘋獲獎通知"].some(str => str === title)) continue;
                if (!ocheckbox.checked) await ocheckbox.click();
                count++;
            }
            const del = document.querySelector('#list_div > button:nth-child(8)');
            await del.click();
            console.log("已刪除" + count + "封垃圾通知");
            return count;
        });
        //await page.waitForSelector('#list_div > button:nth-child(8)');
        //await page.click('#list_div > button:nth-child(8)');
        await page.waitForSelector('.dialogify > form > div > div > div.btn-box.text-right > button.btn.btn-insert.btn-primary');
        await page.click('.dialogify > form > div > div > div.btn-box.text-right > button.btn.btn-insert.btn-primary');
        await page.waitForSelector('.dialogify > form > div > div > div.btn-box.text-center > button');
        await page.click('.dialogify > form > div > div > div.btn-box.text-center > button');
        return count;
    }

    async function nextPageFn() {
        const nextPage = await page.evaluate(async() => {
            const onext = document.querySelector('#list_div > span:nth-child(10) > a');
            if (!onext) return false;
            if (onext.innerText === '下一頁') return true;
            return false;
        });
        return nextPage;
    }

    async function nextPageClickFn() {
        await page.evaluate(async() => {
            const onext = document.querySelector('#list_div > span:nth-child(10) > a');
            if (!onext) return false;
            if (onext.innerText === '下一頁') onext.click();
        });
    }

    //console.log(await nextPageFn());
    /*
        while (await nextPageFn()) {
            while (await mailDelFn());
            await nextPageClickFn();
        }
    */
    while (await mailDelFn());

    //await mailDelFn();
    await browser.close();
})();
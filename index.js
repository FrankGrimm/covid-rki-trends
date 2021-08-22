/*
 * Headless browser automation to extract data from RKI's COVID-19-Trends dashboard
 */

const puppeteer = require('puppeteer');
const fs = require("fs").promises;
const stringify = require('json-stable-stringify');

const DASHBOARD_URL = "https://www.rki.de/DE/Content/InfAZ/N/Neuartiges_Coronavirus/Situationsberichte/COVID-19-Trends/COVID-19-Trends.html?__blob=publicationFile#/home";
const SCREENSHOT_FILENAME = "./screenshot.png";

const state = {
    stage: "init",
};

const indicators = {"descriptions": []}

async function waitFor(ms) {
    return new Promise(res => setTimeout(res, ms));
}

function resolveHandle(jsHandle) {
    return jsHandle.executionContext().evaluate((o) => o, jsHandle);
}

function descriptorKey(d) {
    let key = "";
    if (!d.indicator) {
        console.log("noindicator", d);
    }

    key = d.indicator;
    if (d.group) {
        key += "/" + d.group;
    }
    if (d.region) {
        key += "/" + d.region;
    }

    return key;
}

function pushIndicator(descriptor, obj) {
    if (obj.description) {
        indicators.descriptions.push(obj);
        return;
    }
    
    if (!(descriptor.indicator in indicators)) {
        indicators[descriptor.indicator] = {};
    }
    const target = indicators[descriptor.indicator];
    const subkey = descriptorKey(descriptor);
    if (subkey.indexOf("divi_") > -1) {
        return; // skip DIVI database content due to licensing
    }

    if (!(subkey in target)) {
        target[subkey] = [];
    }
    target[subkey].push(obj);
}

async function interceptConsole(msg) {
    const msgText = msg.text();
    if (!msgText.startsWith("UNCOMPRESSED")) { return; }

    const msgArgs = msg.args();

    const resolved = await Promise.all(msgArgs.map(resolveHandle));
    resolved.forEach(function(arg, idx) {
        if (idx == 0) { return; }
        if (arg === null || typeof arg !== 'object') { return; }
        if (!Array.isArray(arg)) { return; }
        arg.forEach((obj) => {
            const descriptor = {
                region: obj.region, 
                indicator: obj.indicator, 
                group: obj.group,
                agegroup: obj.Altersgruppe,
            };
            if (descriptor.agegroup && !descriptor.group) {
                descriptor.group = descriptor.agegroup;
                descriptor.agegroup = null;
            }
            // clean up objects
            for (let key of ['region', 'indicator', 'group', 'agegroup']) {
                if (!descriptor[key]) {
                    delete descriptor[key];
                }
            }
            pushIndicator(descriptor, obj);
        });
    });
}

(async () => {
    const launchOptions = {
        headless: true,
        defaultViewPort: {width: 1280, height: 800},
        isMobile: false,
    };
    state.stage = "launching";
    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();

    page.on('console', interceptConsole);

    state.stage = "loading"
    await page.goto(DASHBOARD_URL, { waitUntil: 'networkidle2' });

    state.stage = "navigating"
    await page.evaluate(() => {
        document.querySelector("mat-form-field.mat-form-field-type-mat-select").querySelector("div.mat-select-trigger").click()
    });
    await waitFor(2000);
    state.stage = "active";
    await page.evaluate(() => {
        document.querySelector("#mat-option-3").click()
    });
    await waitFor(3000);

    await page.screenshot({ path: SCREENSHOT_FILENAME });

    await browser.close();

    const data = stringify(indicators, {space: 2});
    await fs.writeFile("./data.json", data, "utf-8");
})();

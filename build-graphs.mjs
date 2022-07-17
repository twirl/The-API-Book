import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { pathToFileURL } from 'url';
import puppeteer from 'puppeteer';

const args = process.argv.slice(2);
const dir = process.cwd();

if (args[0] == 'l10n') {
    buildL10N(dir, (args[1] || 'en,ru').split(','));
} else {
    buildGraphs(dir, (args[0] || 'en,ru').split(','), args[1]);
}

async function buildL10N(dir, langs) {
    const l10n = langs.reduce((l10n, lang) => {
        const l10nFile = resolve(dir, 'src', lang, 'l10n.json');
        const contents = JSON.parse(readFileSync(l10nFile).toString('utf-8'));
        l10n[lang] = JSON.stringify(contents);
        return l10n;
    }, {});

    writeFileSync(
        resolve(dir, 'src', 'graphs', 'l10n.js'),
        `(function(global){global.l10n={${Object.entries(l10n)
            .map(
                ([lang, content]) =>
                    `${lang}:JSON.parse(${JSON.stringify(content)})`
            )
            .join(',\n')}}})(this)`
    );
}

async function buildGraphs(dir, langs, source) {
    const srcDir = resolve(dir, 'src', 'graphs');
    const sources = source
        ? [source]
        : readdirSync(srcDir)
              .filter((file) => file.slice(-3) == '.js' && file != 'l10n.js')
              .map((file) => file.slice(0, file.length - 3))
              .sort();
    const indexFileUrl = pathToFileURL(
        resolve(dir, 'src', 'graphs', 'index.html')
    );

    for (const source of sources) {
        console.log(`Building ${source}…`);
        for (const lang of langs) {
            const inFile = `${indexFileUrl}?graph=${source}&lang=${lang}`;
            console.log(`  Open ${inFile}`);
            const browser = await puppeteer.launch({
                headless: true,
                product: 'chrome',
                defaultViewport: {
                    deviceScaleFactor: 2,
                    width: 1000,
                    height: 1000
                }
            });
            const outFile = resolve(dir, 'src', 'img', `graph-${source}.png`);
            const page = await browser.newPage();

            await page.goto(inFile, {
                waitUntil: 'networkidle0'
            });
            const body = await page.$('body');
            await body.screenshot({
                path: outFile,
                type: 'png',
                captureBeyondViewport: true
            });
            console.log(`  ${outFile} saved`);

            await browser.close();
        }
    }
}

import {
    readFileSync,
    writeFileSync,
    readdirSync,
    existsSync,
    mkdirSync
} from 'fs';
import { resolve } from 'path';
import { pathToFileURL } from 'url';
import puppeteer from 'puppeteer';

const args = process.argv.slice(2);
const dir = process.cwd();
const langs = (args[1] || 'en,ru').split(',');
const graphDir = resolve(dir, 'src', 'graphs');
const tmpDir = resolve(graphDir, 'tmp');
const srcDir = resolve(dir, 'src');

if (!existsSync(tmpDir)) {
    mkdirSync(tmpDir);
}
const targets = args[2]
    ? [args[2] + '.yaml']
    : readdirSync(graphDir).filter((i) => i.endsWith('.yaml'));

build(langs, targets, srcDir, graphDir, tmpDir).then(
    () => process.exit(0),
    (e) => {
        throw e;
    }
);

async function build(langs, targets, srcDir, graphDir, tmpDir) {
    await buildL10n(langs, srcDir, tmpDir);
    await buildGraphs(langs, targets, graphDir, tmpDir);
}

async function buildL10n(langs, srcDir, tmpDir) {
    const l10n = langs.reduce((l10n, lang) => {
        const l10nFile = resolve(srcDir, lang, 'l10n.json');
        const contents = JSON.parse(readFileSync(l10nFile).toString('utf-8'));
        l10n[lang] = JSON.stringify(contents);
        return l10n;
    }, {});

    writeFileSync(
        resolve(tmpDir, 'l10n.js'),
        `(function(global){global.l10n={${Object.entries(l10n)
            .map(
                ([lang, content]) =>
                    `${lang}:JSON.parse(${JSON.stringify(content)})`
            )
            .join(',\n')}}})(this)`
    );
}

async function buildGraphs(langs, targets, graphDir, tmpDir) {
    const tasks = langs.reduce(
        (tasks, lang) =>
            tasks.concat(
                targets.map((target) => {
                    lang, target;
                })
            ),
        []
    );
    return Promise.all(tasks.map(({lang, target}) => {
        const yaml = readFileSync(resolve(graphDir, target))
    });

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

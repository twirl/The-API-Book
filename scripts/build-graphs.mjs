import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, basename } from 'path';
import puppeteer from 'puppeteer';
import templates from '../src/templates.js';

const args = process.argv.slice(2);
const dir = process.cwd();
const langs = (args[0] || 'en,ru').split(',');
const target = args[1];

async function buildGraphs(langs, target, srcDir, dstDir, tmpDir) {
    if (!existsSync(tmpDir)) {
        await mkdir(tmpDir);
    }

    for (const lang of langs) {
        const graphDir = resolve(srcDir, lang, 'graphs');
        const targets = target
            ? [resolve(graphDir, target)]
            : await getGraphList(graphDir);

        console.log(
            `Lang=${lang}, ${targets.length} .mermaid files to process`
        );

        for (const t of targets) {
            await buildGraph(lang, t, dstDir, tmpDir);
        }
    }
}

async function getGraphList(srcDir) {
    const files = await readdir(srcDir);
    const result = [];
    for (const file of files) {
        if (file.endsWith('.mermaid')) {
            result.push(resolve(srcDir, file));
        }
    }
    return result;
}

async function buildGraph(lang, target, dstDir, tmpDir) {
    const targetName = basename(target);
    console.log(
        `Processing ${target}, basename: ${targetName} dst: ${dstDir}, tmp: ${tmpDir}`
    );
    const tmpFileName = resolve(tmpDir, `${targetName}.${lang}.html`);
    const graph = await readFile(target, 'utf-8');
    await writeFile(tmpFileName, templates.graphHtmlTemplate(graph));
    console.log(`Tmp file ${tmpFileName} written`);
    const browser = await puppeteer.launch({
        headless: true,
        product: 'chrome',
        defaultViewport: {
            deviceScaleFactor: 2,
            width: 1000,
            height: 1000
        }
    });
    const outFile = resolve(
        dstDir,
        `${targetName.replace('.mermaid', '')}.${lang}.png`
    );
    const page = await browser.newPage();
    await page.goto(tmpFileName, {
        waitUntil: 'networkidle0'
    });
    const body = await page.$('body');
    await body.screenshot({
        path: outFile,
        type: 'png',
        captureBeyondViewport: true
    });
    await browser.close();
}

buildGraphs(
    langs,
    target,
    resolve(dir, 'src'),
    resolve(dir, 'src', 'img', 'graphs'),
    resolve(dir, '.tmp')
)
    .catch((e) => {
        console.error(e);
    })
    .finally(() => {
        console.log('Graph build done');
        process.exit(0);
    });

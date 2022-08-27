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
const langs = (args[0] || 'en,ru').split(',');
const target = args[1];
const srcDir = resolve(dir, 'src');
const graphDir = resolve(srcDir, 'graphs');
const tmpDir = resolve(graphDir, 'tmp');

if (!existsSync(tmpDir)) {
    mkdirSync(tmpDir);
}

build(langs, srcDir, graphDir, tmpDir, target).then(
    () => process.exit(0),
    (e) => {
        throw e;
    }
);

async function build(langs, srcDir, graphDir, tmpDir, target) {
    await buildL10n(langs, srcDir, tmpDir);
    await buildGraphs(langs, srcDir, graphDir, tmpDir, target);
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

async function buildGraphs(langs, srcDir, graphDir, tmpDir, target) {
    const tasks = target
        ? langs.map((lang) => ({
              lang,
              target
          }))
        : langs.reduce(
              (tasks, lang) =>
                  tasks.concat(
                      readdirSync(resolve(srcDir, lang, 'graphs')).map(
                          (file) => ({
                              lang,
                              target: file.replace('.yaml', '')
                          })
                      )
                  ),
              []
          );

    return Promise.all(
        tasks.map(({ lang, target }) =>
            buildGraph({
                lang,
                target,
                yaml: readFileSync(
                    resolve(srcDir, lang, 'graphs', target + '.yaml'),
                    'utf-8'
                ),
                graphDir,
                tmpDir
            })
        )
    );
}

async function buildGraph({ lang, target, yaml, graphDir, tmpDir }) {
    const jsTmpFileName = `wrapped-${lang}-${target}.js`;
    writeFileSync(
        resolve(tmpDir, jsTmpFileName),
        `document.querySelector('.mermaid').innerHTML = ${JSON.stringify(
            yaml.replace(/\\n/g, '\\n')
        )};`
    );
    // console.log(`  Open ${inFile}`);
    // const browser = await puppeteer.launch({
    //     headless: true,
    //     product: 'chrome',
    //     defaultViewport: {
    //         deviceScaleFactor: 2,
    //         width: 1000,
    //         height: 1000
    //     }
    // });
    // const outFile = resolve(dir, 'src', 'img', `graph-${source}.png`);
    // const page = await browser.newPage();

    // await page.goto(inFile, {
    //     waitUntil: 'networkidle0'
    // });
    // const body = await page.$('body');
    // await body.screenshot({
    //     path: outFile,
    //     type: 'png',
    //     captureBeyondViewport: true
    // });
    // console.log(`  ${outFile} saved`);

    // await browser.close();
}

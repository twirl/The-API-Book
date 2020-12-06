const puppeteer = require('puppeteer');
const fs = require('fs');
const mdHtml = new (require('showdown').Converter)();

const l10n = {
    en: {
        title: 'Sergey Konstantinov. The API',
        author: 'Sergey Konstantinov',
        chapter: 'Chapter'
    },
    ru: {
        title: 'Сергей Константинов. API',
        author: 'Сергей Константинов',
        chapter: 'Глава'
    }
};

buildDocs(l10n).then(() => {
    process.exit(0);
}, (e) => {
    console.error(e);
    process.exit(255);
});

function buildDocs (l10n) {
    return Promise.all(
        Object.entries(l10n).map(([lang, l10n]) => buildDoc(lang, l10n))
    );
}

function buildDoc (lang, l10n) {
    const content = getParts({
        path: `./src/${lang}/clean-copy/`,
        l10n,
        pageBreak:'<div class="page-break"></div>'
    }).join('');

    const html = `<html><head>
        <meta charset="utf-8"/>
        <title>${l10n.title}</title>
        <meta name="author" content="${l10n.author}"/>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=PT+Serif&family=PT+Sans&family=Inconsolata"/>
        <style>${fs.readFileSync('src/style.css', 'utf-8')}</style>
    </head><body>
        <article>${content}</article>
    </body></html>`;

    fs.writeFileSync(`./docs/API.${lang}.html`, html);

    return buildPdf(`./docs/API.${lang}.pdf`, html);
}

function getParts ({ path, l10n: { chapter }, pageBreak}) {
    const parts = [
        fs.readFileSync(`${path}intro.html`, 'utf-8') + pageBreak
    ];
    let counter = 1;
    fs.readdirSync(path)
        .filter((p) => fs.statSync(`${path}${p}`).isDirectory())
        .sort()
        .forEach((dir) => {
            const name = dir.split('-')[1];
            parts.push(`<h2>${name}</h2>`);

            const subdir = `${path}${dir}/`;
            fs.readdirSync(subdir)
                .filter((p) => fs.statSync(`${subdir}${p}`).isFile() && p.indexOf('.md') == p.length - 3)
                .sort()
                .forEach((file) => {
                    const md = fs.readFileSync(`${subdir}${file}`, 'utf-8');
                    parts.push(
                        mdHtml.makeHtml(
                            md.trim()
                                .replace(/^### /, `### ${chapter} ${counter++}. `)
                        ) + pageBreak
                    );
                });
        });
    
    return parts;
}

async function buildPdf (path, html) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setContent(html, {
        waitUntil: 'load'
    });
    const pdf = await page.pdf({
        path,
        preferCSSPageSize: true,
        printBackground: true
    });
   
    await browser.close();
}
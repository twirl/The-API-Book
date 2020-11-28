const puppeteer = require('puppeteer');
const fs = require('fs');
const mdHtml = new (require('showdown').Converter)();

const content = getParts({
    path: './src/ru/clean-copy/',
    l10n: {
        chapter: 'Глава'
    },
    pageBreak:'<div class="page-break"></div>'
}).join('');

const html = `<html><head>
    <meta charset="utf-8"/>
    <title>Сергей Константинов. API</title>
    <meta name="author" content="Сергей Константинов"/>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=PT+Serif&family=PT+Sans&family=Inconsolata"/>
    <style>${fs.readFileSync('src/style.css', 'utf-8')}</style>
</head><body>
    <article>${content}</article>
</body></html>`;

fs.writeFileSync('./docs/API.ru.html', html);

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

const printStyles = `
@media print {
    * { 
        text-align: left;
        line-height: 1.55;
    }
    code, pre {
        white-space: pre-wrap;
    }
    h1, h2, h3, h4, h5, h6 {
        page-break-inside: avoid;
    }
    h1::after, h2::after, h3::after, h4::after, h5::after, h6::after {
        content: "";
        display: block;
        height: 100px;
        margin-bottom: -100px;
    }
    p {
        orphans: 2;
        widows: 2;
    }
}`;

async function buildPdf() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setContent(html, {
        waitUntil: 'load'
    });

    await page.addStyleTag({ content: printStyles });

    await page.pdf({
        path: './docs/API.ru.pdf',
        preferCSSPageSize: true,
        printBackground: true
    });
   
    await browser.close();
}

buildPdf().then(() => {
    process.exit(0);
}, (e) => {
    console.error(e);
    process.exit(255);
})
const puppeteer = require('puppeteer');
const fs = require('fs');
const Epub = require('epub-gen');

module.exports = {
    html: function ({ html, path }) {
        return new Promise((resolve, reject) => {
            fs.writeFile(path, html, (e) => {
                if (e) {
                    reject(e);
                } else {
                    resolve();
                }
            });
        });
    },
    pdf: async function ({ path, html }) {
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
    },
    epub: function ({ lang, l10n, structure, path}) {
        const epubData = {
            title: l10n.title,
            author: l10n.author,
            tocTitle: l10n.toc,
            appendChapterTitles: false,
            content: structure.sections.reduce((content, section) => {
                content.push({
                    title: section.title.toUpperCase(),
                    data: `<h2>${section.title}</h2>`
                });
                section.chapters.forEach((chapter) => {
                    content.push({
                        title: chapter.title,
                        data: `<h3>${chapter.title}</h3>\n${chapter.content}`
                    });
                });
                return content;
            }, [{
                title: l10n.frontPage,
                data: structure.frontPage,
                beforeToc: true
            }]),
            lang
        };
        const epub = new Epub(epubData, path);
        return epub.promise;
    }
};
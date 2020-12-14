const fs = require('fs');
const mdHtml = new (require('showdown').Converter)();
const path = require('path');

const langsToBuild = process.argv[2] && 
    process.argv[2].split(',').map((s) => s.trim()) ||
    ['ru', 'en'];

    const targets = (process.argv[3] && 
        process.argv[3].split(',') ||
        ['html', 'pdf', 'epub']
    ).reduce((targets, arg) => {
        targets[arg.trim()] = true;
        return targets;
    }, {});

const l10n = {
    en: {
        title: 'The API',
        author: 'Sergey Konstantinov',
        chapter: 'Chapter',
        toc: 'Table of Contents',
        frontPage: 'Front Page',
        description: "Designing APIs is a very special skill: API is a multiplier to both your opportunities and mistakes. This book is written to share the expertise and describe the best practices in the API design. The book comprises three large sections. In Section I we'll discuss designing APIs as a concept: how to build the architecture properly, from a high-level planning down to final interfaces. Section II is dedicated to an API's lifecycle: how interfaces evolve over time, and how to elaborate the product to match users' needs. Finally, Section III is more about un-engineering sides of the API, like API marketing, organizing support, and working with a community.",
        locale: 'en_US'
    },
    ru: {
        title: 'API',
        author: 'Сергей Константинов',
        chapter: 'Глава',
        toc: 'Содержание',
        frontPage: 'Титульный лист',
        description: 'Разработка API — особый навык: API является как мультипликатором ваших возможностей, так и мультипликатором ваших ошибок. Эта книга написана для того, чтобы поделиться опытом и изложить лучшие практики проектирования API. Книга состоит из трёх больших разделов. В первом разделе мы поговорим о проектировании API на стадии разработки концепции — как грамотно выстроить архитектуру, от крупноблочного планирования до конечных интерфейсов. Второй раздел будет посвящён жизненному циклу API — как интерфейсы эволюционируют со временем и как развивать продукт так, чтобы отвечать потребностям пользователей. Наконец, третий раздел будет касаться больше не-разработческих сторон жизни API — поддержки, маркетинга, работы с комьюнити.',
        locale: 'ru_RU'
    }
};
const css = fs.readFileSync('src/style.css', 'utf-8');

const builders = require('./builders');

buildDocs(langsToBuild, targets, l10n).then(() => {
    console.log('Done!');
    process.exit(0);
}, (e) => {
    console.error(e);
    process.exit(255);
});

function buildDocs (langsToBuild, targets, l10n) {
    console.log(`Building in following languages: ${
        langsToBuild.join(', ')
    }, targets: ${
        Object.keys(targets).join(', ')
    }`);

    return Promise.all(
        langsToBuild.map((lang) => buildDoc(lang, targets, l10n[lang]))
    );
}

function buildDoc (lang, targets, l10n) {
    const pageBreak = '<div class="page-break"></div>';
    const structure = getStructure({
        path: `./src/${lang}/clean-copy/`,
        l10n,
        pageBreak
    });
    const tableOfContents = `<nav><h2>${l10n.toc}</h2><ul class="table-of-contents">${
        structure.sections.map((section) => {
            return `<li><a href="#${section.anchor}">${section.title}</a><ul>${
                section.chapters.map((chapter) => {
                    return `<li><a href="#${chapter.anchor}">${chapter.title}</a></li>`
                }).join('')
            }</ul></li>`;
        }).join('')
    }</ul></nav>${pageBreak}`;
    const getRef = (anchor) => {
        return `<a href="#${anchor}" class="anchor" name="${anchor}"></a>`;
    }
    const htmlContent = [
        structure.frontPage,
        tableOfContents,
        ...structure.sections
            .map((section) => section.chapters.reduce((content, chapter) => {
                if (chapter.title) {
                    content.push(`<h3>${getRef(chapter.anchor)}${chapter.title}</h3>`);
                }
                content.push(chapter.content);
                return content;
            }, [section.title ? `<h2>${getRef(section.anchor)}${section.title}</h2>` : '']).join(''))
    ].join('\n');

    const html = `<html><head>
        <meta charset="utf-8"/>
        <title>${l10n.author}. ${l10n.title}</title>
        <meta name="author" content="${l10n.author}"/>
        <meta name="description" content="${l10n.description}"/>
        <meta property="og:title" content="${l10n.author}. ${l10n.title}"/>
        <meta property="og:url" content="https://twirl.github.io/The-API-Book/docs/API.${lang}.html"/>
        <meta property="og:type" content="article"/>
        <meta property="og:description" content="${l10n.description}"/>
        <meta property="og:locale" content="${l10n.locale}"/>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=PT+Serif&amp;family=PT+Sans&amp;family=Inconsolata"/>
        <style>${css}</style>
    </head><body>
        <article>${htmlContent}</article>
    </body></html>`;

    return Promise.all(['html', 'pdf', 'epub'].map((target) => {
        return targets[target] ? builders[target]({
            lang,
            structure,
            html,
            l10n,
            path: path.join(__dirname, 'docs', `API.${lang}.${target}`)
        }) : Promise.resolve();
    }));
}

function getStructure ({ path, l10n: { chapter }, pageBreak}) {
    const structure = {
        frontPage: fs.readFileSync(`${path}intro.html`, 'utf-8') + pageBreak,
        sections: []
    };
    let counter = 1;
    fs.readdirSync(path)
        .filter((p) => fs.statSync(`${path}${p}`).isDirectory())
        .sort()
        .forEach((dir, index) => {
            const name = dir.split('-')[1];
            const section = {
                title: name,
                anchor: `section-${index + 1}`,
                chapters: []
            }

            const subdir = `${path}${dir}/`;
            fs.readdirSync(subdir)
                .filter((p) => fs.statSync(`${subdir}${p}`).isFile() && p.indexOf('.md') == p.length - 3)
                .sort()
                .forEach((file) => {
                    const md = fs.readFileSync(`${subdir}${file}`, 'utf-8').trim();
                    const [ title, ...paragraphs ] = md.split(/\r?\n/);
                    section.chapters.push({
                        anchor: `chapter-${counter}`,
                        title: title.replace(/^### /, `${chapter} ${counter}. `),
                        content: mdHtml.makeHtml(paragraphs.join('\n')) + pageBreak
                    });
                    counter++;
                });
            
            structure.sections.push(section);
        });
    
    return structure;
}
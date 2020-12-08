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
        frontPage: 'Front Page'
    },
    ru: {
        title: 'API',
        author: 'Сергей Константинов',
        chapter: 'Глава',
        toc: 'Содержание',
        frontPage: 'Титульный лист'
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
    const structure = getStructure({
        path: `./src/${lang}/clean-copy/`,
        l10n,
        pageBreak:'<div class="page-break"></div>'
    });
    const htmlContent = [
        structure.frontPage,
        ...structure.sections
            .map((section) => section.chapters.reduce((content, chapter) => {
                if (chapter.title) {
                    content.push(`<h3>${chapter.title}</h3>`);
                }
                content.push(chapter.content);
                return content;
            }, [section.title ? `<h2>${section.title}</h2>` : '']).join(''))
    ].join('\n');

    const html = `<html><head>
        <meta charset="utf-8"/>
        <title>${l10n.author}. ${l10n.title}</title>
        <meta name="author" content="${l10n.author}"/>
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
        .forEach((dir) => {
            const name = dir.split('-')[1];
            const section = {
                title: name,
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
                        title: title.replace(/^### /, `${chapter} ${counter++}. `),
                        content: mdHtml.makeHtml(paragraphs.join('\n')) + pageBreak
                    });
                });
            
            structure.sections.push(section);
        });
    
    return structure;
}
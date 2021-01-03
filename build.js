const fs = require('fs');
const path = require('path');

const templates = require('./src/templates');
const builders = require('./src/lib/builders');
const mdHtml = require('./src/lib/md-html');
const htmlProcess = require('./src/lib/html-process');

const l10n = {
    en: require('./src/en/l10n.json'),
    ru: require('./src/ru/l10n.json')
};

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

async function buildDoc (lang, targets, l10n) {
    const pageBreak = templates.pageBreak;
    const structure = await getStructure({
        path: `./src/${lang}/clean-copy/`,
        l10n,
        pageBreak
    });
    const tableOfContents = templates.toc(structure, l10n);
    const htmlContent = [
        structure.frontPage,
        tableOfContents,
        ...structure.sections
            .map((section) => section.chapters.reduce((content, chapter) => {
                if (chapter.title) {
                    content.push(templates.chapterTitle(chapter));
                }
                content.push(chapter.content);
                return content;
            }, [templates.sectionTitle(section)]).join(''))
    ];

    return Promise.all(['html', 'pdf', 'epub'].map((target) => {
        if (targets[target]) {
            return prepareHtml(htmlContent.join(''), l10n, target).then((html) => {
                return builders[target]({
                    lang,
                    structure,
                    html,
                    l10n,
                    path: path.join(__dirname, 'docs', `API.${lang}.${target}`)
                });           
            });
        } else {
            return Promise.resolve();
        }
    }));
}

async function getStructure ({ path, l10n, pageBreak}) {
    const structure = {
        frontPage: fs.readFileSync(`${path}intro.html`, 'utf-8') + pageBreak,
        sections: []
    };
    let counter = 1;

    await fs.readdirSync(path)
        .filter((p) => fs.statSync(`${path}${p}`).isDirectory())
        .sort()
        .reduce(async (p, dir, index) => {
            const structure = await p;
            const name = dir.split('-')[1];
            const section = {
                title: name,
                anchor: `section-${index + 1}`,
                chapters: []
            }

            const subdir = `${path}${dir}/`;
            await fs.readdirSync(subdir)
                .filter((p) => fs.statSync(`${subdir}${p}`).isFile() && p.indexOf('.md') == p.length - 3)
                .sort()
                .reduce(async (p, file) => {
                    const section = await p;
                    const md = fs.readFileSync(`${subdir}${file}`, 'utf-8').trim();
                    const content = await mdHtml(md, {
                        counter,
                        l10n,
                        base: __dirname
                    });
                    section.chapters.push({
                        anchor: content.data.anchor,
                        title: content.data.title,
                        content: content.contents + pageBreak
                    });
                    counter++;
                    return section;
                }, Promise.resolve(section));
            
            structure.sections.push(section);
            return structure;
        }, Promise.resolve(structure));
 

    return structure;
}

async function prepareHtml (content, l10n, target) {
    if (target == 'epub') {
        return '';
    } else {
        return (await htmlProcess(
            templates[target == 'html' ? 'screenHtml' : 'printHtml'](content, l10n), {
                base: __dirname
            }
        )).contents;
    }
}
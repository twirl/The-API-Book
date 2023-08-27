import { readFileSync, readdirSync, unlinkSync } from 'fs';
import { resolve as pathResolve } from 'path';
import { init, plugins } from '@twirl/book-builder';
import templates from '../src/templates.js';
import { buildLanding } from './build-landing.mjs';

const flags = process.argv.reduce((flags, v) => {
    switch (v) {
        case '--clean-cache':
            flags.cleanCache = true;
            break;
    }
    return flags;
}, {});

if (flags.cleanCache) {
    console.log('Cleaning cache…');
    clean();
}

const l10n = {
    en: JSON.parse(readFileSync('./src/en/l10n.json', 'utf-8')),
    ru: JSON.parse(readFileSync('./src/ru/l10n.json', 'utf-8'))
};

const langsToBuild = (process.argv[2] &&
    process.argv[2].split(',').map((s) => s.trim())) || ['ru', 'en'];

const targets = (
    (process.argv[3] && process.argv[3].split(',')) || [
        'html',
        'pdf',
        'epub',
        'landing'
    ]
).reduce((targets, arg) => {
    targets[arg.trim()] = true;
    return targets;
}, {});

const chapters = process.argv[4];
const noCache = process.argv[5] == '--no-cache';

console.log(`Building langs: ${langsToBuild.join(', ')}…`);
(async () => {
    for (const lang of langsToBuild) {
        await init({
            l10n: l10n[lang],
            basePath: pathResolve(`src`),
            path: pathResolve(`src/${lang}/clean-copy`),
            templates,
            pipeline: {
                css: {
                    beforeAll: [
                        plugins.css.backgroundImageDataUri,
                        plugins.css.fontFaceDataUri
                    ]
                },
                ast: {
                    preProcess: [
                        plugins.ast.h3ToTitle,
                        plugins.ast.h5Counter,
                        plugins.ast.aImg,
                        plugins.ast.imgSrcResolve,
                        plugins.ast.highlighter({
                            languages: ['javascript', 'typescript']
                        }),
                        plugins.ast.ref,
                        plugins.ast.ghTableFix,
                        plugins.ast.stat
                    ]
                },
                htmlSourceValidator: {
                    validator: 'WHATWG',
                    ignore: [
                        'heading-level',
                        'no-raw-characters',
                        'wcag/h37',
                        'no-missing-references'
                    ]
                },
                html: {
                    postProcess: [plugins.html.imgDataUri]
                }
            },
            chapters,
            noCache
        }).then(async (builder) => {
            for (const target of Object.keys(targets)) {
                if (target !== 'landing') {
                    await builder.build(
                        target,
                        pathResolve(
                            'docs',
                            `${l10n[lang].file}.${lang}.${target}`
                        )
                    );
                    console.log(
                        `Finished lang=${lang} target=${target}\n${Object.entries(
                            {
                                sources: 'Sources',
                                references: 'references',
                                words: 'words',
                                characters: 'characters'
                            }
                        )
                            .map(([k, v]) => `${v}: ${builder.structure[k]}`)
                            .join(', ')}`
                    );
                } else {
                    buildLanding(builder.structure, lang, l10n, templates);
                }
            }
        });
    }
})();

function clean() {
    const tmpDir = pathResolve('.', '.tmp');
    const files = readdirSync(tmpDir);
    for (const fileName of files) {
        const file = pathResolve(tmpDir, fileName);
        unlinkSync(file);
    }
}

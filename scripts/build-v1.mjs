import { resolve as pathResolve } from 'path';
import templates from './src/templates.js';
import { init, plugins } from '@twirl/book-builder';
import { readFileSync } from 'fs';

const basePath = pathResolve('src', 'v1');

const l10n = {
    en: JSON.parse(
        readFileSync(pathResolve(basePath, 'en', 'l10n.json'), 'utf-8')
    ),
    ru: JSON.parse(
        readFileSync(pathResolve(basePath, 'ru', 'l10n.json'), 'utf-8')
    )
};

const langsToBuild = ['ru', 'en'];

const targets = ['html', 'pdf', 'epub'].reduce((targets, arg) => {
    targets[arg.trim()] = true;
    return targets;
}, {});

console.log(`Building langs: ${langsToBuild.join(', ')}…`);

langsToBuild.forEach((lang) => {
    init({
        l10n: l10n[lang],
        basePath,
        path: pathResolve(basePath, lang, 'clean-copy'),
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
                    plugins.ast.mermaid,
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
        }
    }).then((builder) => {
        Object.keys(targets).forEach((target) => {
            builder.build(
                target,
                pathResolve(
                    'docs',
                    'v1',
                    `${l10n[lang].file}.${lang}.${target}`
                )
            );
            console.log(
                `Finished lang=${lang} target=${target}\n${Object.entries({
                    sources: 'Sources',
                    references: 'references',
                    words: 'words',
                    characters: 'characters'
                })
                    .map(([k, v]) => `${v}: ${builder.structure[k]}`)
                    .join(', ')}`
            );
        });
    });
});

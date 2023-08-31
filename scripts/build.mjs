import { readFileSync, readdirSync, unlinkSync } from 'fs';
import { resolve as pathResolve } from 'path';
import { init, plugins } from '@twirl/book-builder';
import { templates } from '../src/templates.mjs';
import { apiHighlight } from '../src/api-highlight.mjs';
import { buildLanding } from './build-landing.mjs';

const { flags, args } = process.argv.slice(2).reduce(
    ({ flags, args }, v) => {
        switch (v) {
            case '--no-cache':
                flags.noCache = true;
                break;
        }
        if (!v.startsWith('--')) {
            args.push(v);
        }
        return { flags, args };
    },
    {
        args: [],
        flags: {}
    }
);

const l10n = {
    en: JSON.parse(readFileSync('./src/en/l10n.json', 'utf-8')),
    ru: JSON.parse(readFileSync('./src/ru/l10n.json', 'utf-8'))
};

const langsToBuild = (args[0] && args[0].split(',').map((s) => s.trim())) || [
    'ru',
    'en'
];

const targets = (
    (args[1] && args[1].split(',')) || ['html', 'pdf', 'epub', 'landing']
).reduce((targets, arg) => {
    targets[arg.trim()] = true;
    return targets;
}, {});

const chapters = args[2];
const noCache = flags.noCache;

if (flags.noCache) {
    clean();
}

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
                            languages: ['javascript', 'typescript', 'json'],
                            languageDefinitions: {
                                json: apiHighlight
                            }
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
            noCache,
            cover: 'src/cover_embed.png'
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

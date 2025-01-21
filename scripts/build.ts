import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import {
    Bibliography,
    init,
    Path,
    plugins,
    LogLevel,
    applyAstPluginToStructure,
    L10n,
} from '@twirl/book-builder';
import { buildLanding } from './build-landing';
import { CustomTemplates, ExtraStrings } from '../src/templates';

const SRC = resolve('./src') as Path;
const LOCALES: { [language: string]: string } = {
    en: 'en-US',
    ru: 'ru-RU'
};

const { args, flags } = process.argv.slice(2).reduce(
    ({ args, flags }, v) => {
        if (v.startsWith('--')) {
            flags.add(
                v.slice(2).replace(/-\w/g, (m) => m.charAt(1).toUpperCase())
            );
        } else {
            args.push(v);
        }
        return { args, flags };
    },
    { args: [] as string[], flags: new Set<string>() }
);

async function initBuilder(
    language: string,
    locale: string,
    strings: ExtraStrings,
    target: 'epub' | 'html' | 'pdf'
): Promise<{
    bookBuilder: Awaited<ReturnType<typeof init>>;
    templates: CustomTemplates;
    l10n: L10n<CustomTemplates, ExtraStrings>;
}> {
    const bookBuilder = await init({
        source: {
            dir: resolve(SRC, language, 'clean-copy') as Path,
            base: SRC
        },
        options: {
            tmpDir: resolve('./.tmp') as Path,
            noCache: flags.has('noCache'),
            purgeCache: flags.has('purgeCache'),
            logLevel: LogLevel.DEBUG
        }
    });
    const templates = new CustomTemplates(
        target,
        bookBuilder.context,
        language,
        locale,
        {
            ...strings,
            favicon: await bookBuilder.toDataUri(strings.favicon)
        },
        { anchorLink: 'anchor', externalLink: 'external' }
    );
    return {
        bookBuilder,
        templates,
        l10n: { language, locale, strings, templates }
    };
}
const builders = {
    html: async ({
        outFile,
        language,
        locale,
        strings,
        bibliography,
        cssFiles
    }) => {
        const { bookBuilder, templates, l10n } = await initBuilder(
            language,
            locale,
            strings,
            'html'
        );

        await bookBuilder.build<CustomTemplates, ExtraStrings, 'html'>(
            'html',
            l10n,
            {
                structure: {
                    plugins: [
                        plugins.structure.h3Title(),
                        plugins.structure.h5Counter(),
                        plugins.structure.highlighter({
                            languages: ['javascript', 'typescript', 'json']
                        }),
                        plugins.structure.hoistSingleChapters(),
                        plugins.structure.tableOfContents(),
                        plugins.structure.imprintPages(
                            templates.htmlImprintPages(),
                            'front-page'
                        ),
                        plugins.structure.reference({
                            bibliography
                        }),
                        plugins.structure.imgDataUri(),
                        plugins.structure.aImg()
                    ]
                },
                html: {
                    plugins: [plugins.html.validator()]
                },
                css: {
                    plugins: [plugins.css.dataUri()]
                }
            },
            {
                css: [cssFiles.FONTS, cssFiles.COMMON, cssFiles.SCREEN].join(
                    '\n'
                ),
                outFile
            }
        );
    },
    epub: async ({
        outFile,
        language,
        locale,
        strings,
        bibliography,
        cssFiles,
        baseDir
    }) => {
        const { bookBuilder, templates, l10n } = await initBuilder(
            language,
            locale,
            strings,
            'epub'
        );

        await bookBuilder.build<CustomTemplates, ExtraStrings, 'epub'>(
            'epub',
            l10n,
            {
                structure: {
                    plugins: [
                        plugins.structure.h3Title(),
                        plugins.structure.h5Counter(),
                        plugins.structure.highlighter({
                            languages: ['javascript', 'typescript', 'json']
                        }),
                        plugins.structure.hoistSingleChapters(),
                        plugins.structure.imprintPages(
                            templates.htmlImprintPages(),
                            'front-page'
                        ),
                        plugins.structure.reference({
                            bibliography,
                            prependPath: 'bibliography.xhtml'
                        }),
                        plugins.structure.epubLink(),
                        plugins.structure.aImg(),
                        plugins.structure.imgSrcToFileUrl(baseDir)
                    ]
                },
                epub: {
                    plugins: []
                },
                css: {
                    plugins: []
                }
            },
            {
                css: [cssFiles.COMMON, cssFiles.EPUB].join('\n'),
                outFile
            }
        );
    },
    pdf: async ({
        outFile,
        language,
        locale,
        strings,
        bibliography,
        cssFiles
    }) => {
        const { bookBuilder, templates, l10n } = await initBuilder(
            language,
            locale,
            strings,
            'pdf'
        );

        await bookBuilder.build<CustomTemplates, ExtraStrings, 'pdf'>(
            'pdf',
            l10n,
            {
                structure: {
                    plugins: [
                        plugins.structure.h3Title(),
                        plugins.structure.h5Counter(),
                        plugins.structure.highlighter({
                            languages: ['javascript', 'typescript', 'json']
                        }),
                        plugins.structure.hoistSingleChapters(),
                        plugins.structure.tableOfContents(),
                        plugins.structure.imprintPages(
                            templates.htmlImprintPages(),
                            'front-page'
                        ),
                        plugins.structure.reference({
                            bibliography
                        }),
                        plugins.structure.imgDataUri(),
                        plugins.structure.aImg()
                    ]
                },
                pdf: {
                    plugins: []
                },
                css: {
                    plugins: [plugins.css.dataUri()]
                }
            },
            {
                css: [
                    cssFiles.FONTS,
                    cssFiles.COMMON,
                    cssFiles.PAGE,
                    cssFiles.PRINT
                ].join('\n'),
                outFile,
                useCachedContent: false
            }
        );
    },
    landing: async ({ language, locale, strings }) => {
        const { bookBuilder, templates } = await initBuilder(
            language,
            locale,
            strings,
            'html'
        );
        await applyAstPluginToStructure(
            bookBuilder.context,
            { language, locale, strings, templates },
            bookBuilder.structure,
            plugins.structureAst.h3Title()
        );
        await buildLanding({
            structure: bookBuilder.structure,
            lang: language,
            examplesDir: resolve('docs', 'examples') as Path,
            outFile: resolve('docs', strings.landingFile) as Path,
            strings,
            templates
        });
    }
} as {
    [target: string]: (params: {
        outFile: Path;
        language: string;
        locale: string;
        strings: ExtraStrings;
        bibliography: Bibliography;
        cssFiles: Record<string, string>;
        baseDir: Path;
    }) => Promise<void>;
};

async function main() {
    const cssFiles = {
        COMMON: await readFile(resolve(SRC, 'css', 'common.css'), 'utf-8'),
        FONTS: await readFile(resolve(SRC, 'css', 'fonts.css'), 'utf-8'),
        SCREEN: await readFile(resolve(SRC, 'css', 'screen.css'), 'utf-8'),
        EPUB: await readFile(resolve(SRC, 'css', 'epub.css'), 'utf-8'),
        PRINT: await readFile(resolve(SRC, 'css', 'print.css'), 'utf-8'),
        PAGE: await readFile(resolve(SRC, 'css', 'page.css'), 'utf-8')
    };

    const languages = (args[0] ?? 'en,ru').split(',').map((s) => s.trim());
    const targets = (args[1] ?? 'html,epub,pdf')
        .split(',')
        .map((s) => s.trim());

    for (const language of languages) {
        const locale = LOCALES[language];
        if (!locale) {
            throw new Error(`Unknown locale ${locale}`);
        }
        const strings = JSON.parse(
            await readFile(resolve(SRC, language, 'l10n.json'), 'utf-8')
        ) as ExtraStrings;
        const bibliography = JSON.parse(
            await readFile(resolve(SRC, language, 'bibliography.json'), 'utf-8')
        ) as Bibliography;

        for (const target of targets) {
            const builder = builders[target];
            if (typeof builder !== 'function') {
                throw new Error(`Unknown target ${target}`);
            }
            const outFile = resolve(
                'docs',
                `API.${language}.${target}`
            ) as Path;
            await builder({
                outFile,
                language,
                locale,
                strings,
                bibliography,
                cssFiles,
                baseDir: SRC
            });
        }
    }
}

main()
    .catch((e) => console.error(e, e.stack))
    .then(() => process.exit(0));

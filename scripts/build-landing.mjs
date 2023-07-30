import { resolve } from 'path';
import { readdirSync, writeFileSync, statSync } from 'fs';

const examplesDir = resolve('docs', 'examples');

export const buildLanding = (structure, lang, l10n, templates) => {
    const examples = readdirSync(examplesDir);

    const landingHtml = templates.landing({
        structure: structure,
        examples: examples.reduce((examples, folder) => {
            const fullName = resolve(examplesDir, folder);
            if (statSync(fullName).isDirectory()) {
                const name = folder.match(/^\d+\. (.+)$/)[1];
                examples.push({
                    name,
                    path: `examples/${folder}`
                });
            }
            return examples;
        }, []),
        l10n: l10n[lang],
        lang,
        templates
    });
    writeFileSync(resolve('docs', l10n[lang].landingFile), landingHtml);
};

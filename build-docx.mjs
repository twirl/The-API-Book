import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import htmlDocxJs from 'html-docx-js';

const dir = process.cwd();

const languages = (process.argv[2] && process.argv[2].split(',')) || [
    'en',
    'ru'
];

languages.forEach(async (lang) => {
    const l10n = JSON.parse(
        readFileSync(resolve(dir, 'src', lang, 'l10n.json'))
    );
    const html = readFileSync(
        resolve(dir, 'docs', `${l10n.file}.${lang}.html`),
        'utf-8'
    );
    writeFileSync(
        resolve(dir, 'docs', `${l10n.file}.${lang}.docx`),
        htmlDocxJs.asBlob(html)
    );
});

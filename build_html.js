const fs = require('fs');
const mdHtml = new (require('showdown').Converter)();

const md = getParts({
    path: './src/ru/clean-copy/',
    l10n: {
        chapter: 'Глава'
    }
}).join('\n\n');
const html = `<html><head>
    <meta charset="utf-8"/>
    <title>Сергей Константинов. API</title>
    <link rel="stylsheet" href="https://fonts.googleapis.com/css?family=PT+Serif"/>
    <link rel="stylsheet" href="https://fonts.googleapis.com/css?family=Inconsolata"/>
</head><body>
    <article>${mdHtml.makeHtml(md)}</article>
</body></html>`;

function getParts ({ path, l10n: { chapter }}) {
    const parts = [
        fs.readFileSync(`${path}intro.md`, 'utf-8')
    ];
    let counter = 1;
    fs.readdirSync(path)
        .filter((p) => fs.statSync(`${path}${p}`).isDirectory())
        .sort()
        .forEach((dir) => {
            const name = dir.split('-')[1];
            parts.push(`## ${name}`);

            const subdir = `${path}${dir}/`;
            fs.readdirSync(subdir)
                .filter((p) => fs.statSync(`${subdir}${p}`).isFile() && p.indexOf('.md') == p.length - 3)
                .sort()
                .forEach((file) => {
                    const md = fs.readFileSync(`${subdir}${file}`, 'utf-8');
                    parts.push(md.trim().replace(/$### /, `### ${chapter} ${counter++}. `));
                });
        });
    
    return parts;
}

process.stdout.write(html);
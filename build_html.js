const fs = require('fs');
const mdHtml = new (require('showdown').Converter)();

const md = fs.readFileSync('./src/API.ru.md', 'utf-8');
const html = `<html><head><meta charset="utf-8"/><title>Сергей Константинов. API</title></head>
    <body><article>${mdHtml.makeHtml(md)}</article></body>
</html>`;

process.stdout.write(html);
const fs = require('fs');
process.stdout.write(fs.readFileSync('./dist/API.ru.html', 'utf-8'));
const express = require('express');
const port = process.argv[2];

express()
    .use('/', express.static('docs'))
    .listen(port, () => {
        console.log(`Docs Server is listening port ${port}`);
    });

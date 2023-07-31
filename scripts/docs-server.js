const express = require('express');
const port = process.argv[2];

express()
    .get('/', (req, res) => {
        res.redirect('/The-API-Book');
    })
    .use('/The-API-Book', express.static('docs'))
    .listen(port, () => {
        console.log(`Docs Server is listening port ${port}`);
    });

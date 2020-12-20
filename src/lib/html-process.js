const unified = require('unified');
const rehypeParse = require('rehype-parse');
const stringify = require('rehype-stringify');

const imageProcessor = require('./image-processor');

module.exports = function (contents, data) {
    return unified()
        .use(rehypeParse)
        .use(imageProcessor)
        .use(stringify)
        .process({ contents, data });
}
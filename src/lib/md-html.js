const path = require('path');

const unified = require('unified');
const remarkParse = require('remark-parse');
const remarkRehype = require('remark-rehype');
const rehypeStringify = require('rehype-stringify');

const chapterProcessor = () => {
    return (tree, file) => {
        const counter = file.data.counter;
        const l10n = file.data.l10n;

        file.data.anchor = file.data.anchor = `chapter-${counter}`;
        const title = [
            `${l10n.chapter} ${counter}`
        ];

        const imageProcess = function (node) {
            if (node.tagName == 'img' && node.properties.src.indexOf('/') == 0) {
                node.properties.src = path.resolve(
                    file.data.base,
                    node.properties.src.replace(/^\//, '')
                );
            }
            if (node.children) {
                node.children.forEach(imageProcess);
            }
        }

        tree.children.slice().forEach((node, index) => {
            switch (node.tagName) {
                case 'h3':
                    title.push(node.children[0].value);
                    tree.children.splice(index, 1);
                    break;
            }
            imageProcess(node);
        });
        file.data.title = title.join('. ');
    }
}

module.exports = (contents, data) => {
    return unified()
        .use(remarkParse)
        .use(remarkRehype)
        .use(chapterProcessor)
        .use(rehypeStringify)
        .process({
            contents,
            data
        });
}
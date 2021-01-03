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

        let h5counter = 0;
        tree.children.slice().forEach((node, index) => {
            switch (node.tagName) {
                case 'h3':
                    title.push(node.children[0].value);
                    tree.children.splice(index, 1);
                    h5counter = 0;
                    break;
                case 'h5':
                    let value = node.children[0].value;
                    let number;
                    const match = value.match(/^\d+/);
                    if (!match) {
                        number = ++h5counter;
                        value = `${number}. ${value}`;
                    } else {
                        number = match[0];
                    }
                    const anchor = `chapter-${counter}-paragraph-${number}`;

                    node.children[0] = {
                        type: 'element',
                        tagName: 'a',
                        properties: {
                            href: '#' + anchor,
                            name: anchor,
                            className: ['anchor']
                        },
                        children: [{
                            type: 'text',
                            value
                        }],
                        position: node.children[0].position
                    };
                    
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
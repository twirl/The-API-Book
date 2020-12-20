const imageDataUri = require('image-data-uri');

module.exports = () => {
    return (tree, file, next) => {
        const images = [];
        const imageSearch = (node) => {
            if (node.tagName == 'img') {
                images.push(node);
            }
            if (node.children && node.children.length) {
                node.children.forEach(imageSearch);
            } 
        }

        imageSearch(tree);

        Promise.all(images.map((imageNode) => {
            const src = imageNode.properties.src;
            return (
                src.indexOf('http') == 0 ?
                    imageDataUri.encodeFromURL(src) :
                    imageDataUri.encodeFromFile(src)
            ).then((src) => {
                imageNode.properties.src = src;
            });
        })).then(() => {
            next();
        });
    }
};
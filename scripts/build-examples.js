const webpack = require('webpack');
const path = require('path');

const dir = process.argv[2];

webpack(require(path.resolve(dir, 'webpack.config.js'))).run((err, stats) => {
    if (err) {
        console.error(`Error ${err.toString()}\n${err.stack}`);
    }
    console.log(`${dir} processed`);
    process.exit(0);
});

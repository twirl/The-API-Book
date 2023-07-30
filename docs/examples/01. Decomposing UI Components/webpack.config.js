const path = require('path');

module.exports = {
    entry: path.resolve(__dirname, 'src/index.ts'),
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            configFile: path.resolve(__dirname, 'tsconfig.json')
                        }
                    }
                ],
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts']
    },
    output: {
        filename: 'index.js',
        path: __dirname,
        library: { name: 'ourCoffeeSdk', type: 'window' }
    }
};

module.exports = {
    entry: './index.ts',
    output: {
        filename: './downscaler.js',
        library: 'DownScaler',
        libraryTarget: 'umd'
    },
    resolve: {
        extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js']
    },
    module: {
        loaders: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader'
            }
        ]
    }
};

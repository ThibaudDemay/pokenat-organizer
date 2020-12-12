var webpack = require('webpack');

module.exports = {
    chainWebpack: config => {
        config
            .plugin('html')
            .tap(args => {
                args[0].title = "Pokenat Organizer";
                return args;
            })
    },
    configureWebpack: config => {
        return {
            plugins: [
                new webpack.DefinePlugin({
                    'process.env': {
                        'APP_VERSION': JSON.stringify(require('./package.json').version),
                    }
                })
            ]
        }
    },
    pwa: {
        name: "Pokenat Organizer"
    }
}
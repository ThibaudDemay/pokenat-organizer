module.exports = {
    chainWebpack: config => {
        config
            .plugin('html')
            .tap(args => {
                args[0].title = "Pokenat Organizer";
                return args;
            })
    },
    pwa: {
        name: "Pokenat Organizer"
    }
}
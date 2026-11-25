const TitleColorMixin = {
    async resolveTitleColor() {
        const style = {
            '--title-color': 'white',
            '--title-shadow': '1px 1px 0 black',
        };
        return { id: 'title-color', style };
    },
};

export default {
    group: 'vars',
    resolve: 'resolveTitleColor',
    mixin: TitleColorMixin
};

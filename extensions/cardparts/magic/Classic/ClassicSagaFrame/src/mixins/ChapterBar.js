const ChapterBarMixin = {
    get chapterBarUrl() {
        return this.resolveAssetPath('element/divider.png');
    },

    async resolveChapterBar() {
        const style = { '--chapter-bar': `url("${this.chapterBarUrl}")` };
        return { id: 'chapter-bar', style };
    },
};

export default {
    group: 'vars',
    resolve: 'resolveChapterBar',
    mixin: ChapterBarMixin
};

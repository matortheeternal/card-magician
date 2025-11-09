const allDefined = (...args) => args.every(arg => arg !== undefined);

export default async function(card, utils) {
    const { buildPipeline } = await utils.import('backgroundPipeline.js');
    const backgroundPipeline = buildPipeline(utils);
    card.showFaceSymbol = false;

    function makeStyles(backgrounds) {
        const styles = Object.values(backgrounds);
        for (const style of styles) {
            style.backgroundImage = `url("${style.url}")`;
            delete style.url;
        }
        return styles;
    }

    function getFrameFolder() {
        return card.isSnow() ? 'snow' : card.id;
    }

    card.buildBackgrounds = async function() {
        const backgrounds = {};
        card.backgroundsUsed = [];
        for (let pipe of backgroundPipeline) {
            if (!pipe.useBackground(card)) continue;
            card.backgroundsUsed.push(pipe.name);
            await pipe.apply(card, backgrounds);
        }
        return makeStyles(backgrounds);
    }

    Alpine.effect(async () => {
        const canGenerate = allDefined(card.colorIdentity, card.superType, card.subType);
        card.frameFolder = canGenerate ? getFrameFolder() : card.id;
        card.backgrounds = canGenerate ? await card.buildBackgrounds() : [];
    });

    card.setFrame(await utils.loadFile('frame.html'));
    card.addStyle(await utils.loadFile('frame.css'));
}

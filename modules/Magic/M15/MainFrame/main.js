export default async function(card, utils) {
    const { buildPipeline } = await utils.import('backgroundPipeline.js');
    const backgroundPipeline = buildPipeline(utils);

    function makeStyles(backgrounds) {
        const styles = Object.values(backgrounds);
        for (const style of styles) {
            style.backgroundImage = `url("${style.url}")`;
            delete style.url;
        }
        return styles;
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
        const canGenerate = card.color !== undefined && card.superType !== undefined;
        card.backgrounds = canGenerate ? await card.buildBackgrounds() : [];
    });

    card.setFrame(await utils.loadFile('frame.html'));
    card.addStyle(await utils.loadFile('frame.css'));
}

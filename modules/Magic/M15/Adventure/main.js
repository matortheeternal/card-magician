export default async function(card, utils) {
    card.setFrame(await utils.loadFile('frame.html'));
    card.addStyle(await utils.loadFile('style.css'));
}

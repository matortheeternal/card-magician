// Compatibility for templates and extensions using the former card APIs.
export default class SymbolsModule extends CardMagicianModule {
    async init(card) {
        card.parseSymbols = activeGame.parseSymbols.bind(activeGame);
        card.symbolsToHTML = activeGame.symbolsToHTML.bind(activeGame);
    }
}

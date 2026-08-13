export default class AutoNumberModule extends CardMagicianModule {
    bind(card, watch) {
        watch(card, [
            'name',
            'manaCost',
            'color',
            'rarity',
            'colorIdentity',
            'superType'
        ], () => window.activeProject.updateNumbering());
        watch(
            window.activeProject,
            'collectorNumberFormat',
            () => window.activeProject.updateNumbering()
        );
    }
}

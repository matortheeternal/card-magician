export default class AutoNumberModule extends CardMagicianModule {
    bind(card, watch) {
        const { baseCard } = card.parent();
        watch(baseCard, `${card.id}.autoCollectorNumber`,
              () => this.syncAutoNumber(card, baseCard)
        );
        watch(
            window.activeProject,
            'collectorNumberFormat',
            () => window.activeProject.updateNumbering()
        );
    }

    syncAutoNumber(face, baseCard) {
        face.autoCollectorNumber = baseCard[face.id].autoCollectorNumber;
        changed(face, 'autoCollectorNumber');
    }
}

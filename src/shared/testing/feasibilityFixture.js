import { createCard, createTestProject, setCardFields, flushCard } from './testUtils.js';
import { cardsToBlob } from '../../domain/export/cardImageExporter.js';
import { writeBinaryFile } from '../platformAdapter.js';

/** A repeatable card for runtime screenshots and real export/persistence checks. */
export async function setupFeasibilityFixture() {
    if (!appEnvironment.id.startsWith('cardmagician.feasibility.'))
        throw new Error('Feasibility checks require an isolated application ID.');
    await createTestProject();
    const card = await createCard();
    const art = new File([
        '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">'
        + '<defs><linearGradient id="g"><stop stop-color="#285aa8"/>'
        + '<stop offset="1" stop-color="#e8ae49"/></linearGradient></defs>'
        + '<rect width="600" height="400" fill="url(#g)"/>'
        + '<circle cx="300" cy="180" r="95" fill="#f8e6ba"/>'
        + '<path d="M0 400L180 170L330 360L460 200L600 400" fill="#253946"/>'
        + '</svg>'
    ], 'feasibility.svg', { type: 'image/svg+xml' });
    await setCardFields({
        name: 'A Measured Transition', manaCost: '2WU',
        superType: 'Creature', subType: 'Human Wizard',
        rulesText: 'Flying\nWhen this creature enters, draw a card.\n'
            + '{T}: Add {W} or {U}.',
        flavorText: 'Every detail deserves a second look.', artImage: art
    });
    await flushCard();
    await activeProject.saveAll(activeProject.filePath);
    const restored = await activeGame.Project.load(activeProject.filePath);
    if (restored.cards[0]?.front.name !== 'A Measured Transition')
        throw new Error('The saved project did not reopen correctly.');
    const blob = await cardsToBlob([card]);
    const bytes = await blob.arrayBuffer();
    await writeBinaryFile(`${appEnvironment.paths.data}/feasibility-card.png`, bytes);
    const image = await createImageBitmap(blob);
    await document.fonts.ready;
    await new Promise(resolve => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
    });
    window.feasibility = {
        uiReadyMs: performance.getEntriesByName('cm-ui-ready')[0].startTime,
        readyAt: performance.now(),
        export: { bytes: blob.size, width: image.width, height: image.height },
        projectPath: activeProject.filePath,
        fonts: [...document.fonts].map(font => ({
            family: font.family, status: font.status
        })),
        userAgent: navigator.userAgent,
        devicePixelRatio
    };
    image.close();
}

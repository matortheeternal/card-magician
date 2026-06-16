import { AbilityConverter } from './AbilityConverter.js';

describe('AbilityConverter', () => {
    const convertParagraphs = (text) => text.split(/\n+/).map(line => {
        return `<p>${line}</p>`;
    }).join('\n');
    const options = { convertParagraphs };

    it('should handle static abilities', () => {
        const text = 'Static ability text.';
        const match = AbilityConverter.match(text);
        expect(match).toBeTruthy();
        const result = AbilityConverter.convert(match, options);
        expect(result).toContain('<div class="walker-static-ability">');
        expect(result).toContain('<p>Static ability text.</p>');
    });

    it('should handle multiple static abilities', () => {
        const text = 'First.\nSecond.';
        const match = AbilityConverter.match(text);
        expect(match).toBeTruthy();
        const result = AbilityConverter.convert(match, options);
        expect(result).toContain('<div class="walker-static-ability">');
        expect(result).toContain('<p>First.</p>\n<p>Second.</p>');
    });

    it('should handle neutral ability', () => {
        const text = '0: Neutral ability.';
        const match = AbilityConverter.match(text);
        const result = AbilityConverter.convert(match, options);
        expect(result).toContain('<div class="walker-ability">');
        expect(result).toContain('<div class="walker-ability-zero">0</div>');
        expect(result).toContain('<div class="walker-ability-content">');
        expect(result).toContain('<p>Neutral ability.</p>');
    });

    it('should handle plus ability', () => {
        const text = '+1: Plus ability.';
        const match = AbilityConverter.match(text);
        const result = AbilityConverter.convert(match, options);
        expect(result).toContain('<div class="walker-ability">');
        expect(result).toContain('<div class="walker-ability-plus">+1</div>');
        expect(result).toContain('<div class="walker-ability-content">');
        expect(result).toContain('<p>Plus ability.</p>');
    });

    it('should handle minus ability', () => {
        const text = '-3: Minus ability.';
        const match = AbilityConverter.match(text);
        const result = AbilityConverter.convert(match, options);
        expect(result).toContain('<div class="walker-ability">');
        expect(result).toContain('<div class="walker-ability-minus">-3</div>');
        expect(result).toContain('<div class="walker-ability-content">');
        expect(result).toContain('<p>Minus ability.</p>');
    });

    it('should handle minus X ability', () => {
        const text = '-X: Minus X ability.';
        const match = AbilityConverter.match(text);
        expect(match).toBeTruthy();
        const result = AbilityConverter.convert(match, options);
        expect(result).toContain('<div class="walker-ability">');
        expect(result).toContain('<div class="walker-ability-minus">-X</div>');
        expect(result).toContain('<div class="walker-ability-content">');
        expect(result).toContain('<p>Minus X ability.</p>');
    });

    it('should handle real-world 3-ability planeswalker', () => {
        const text = [
            '+1: Draw a card.',
            '-2: Target creature gets -2/-2.',
            '-7: You win the game.',
        ].join('\n');
        const match = AbilityConverter.match(text);
        const result = AbilityConverter.convert(match, options);
        const abilityMatches = result.match(/<div class="walker-ability">/g);
        expect(abilityMatches.length).toBe(3);
        expect(result).toContain('<div class="walker-ability-plus">+1</div>');
        expect(result).toContain('<div class="walker-ability-minus">-2</div>');
        expect(result).toContain('<div class="walker-ability-minus">-7</div>');
        expect(result).toContain('<p>Draw a card.</p>');
        expect(result).toContain('<p>Target creature gets -2/-2.</p>');
        expect(result).toContain('<p>You win the game.</p>');
    });

    it('should handle leading and trailing static abilities', () => {
        const text = 'Static 1.\n+1: Plus.\nStatic 2.';
        const match = AbilityConverter.match(text);
        const result = AbilityConverter.convert(match, options);
        const abilityMatches = result.match(/<div class="walker-(static-)?ability">/g);
        expect(abilityMatches.length).toBe(3);
        expect(result).toContain('<div class="walker-ability-plus">+1</div>');
        expect(result).toContain('<p>Static 1.</p>');
        expect(result).toContain('<p>Plus.</p>');
        expect(result).toContain('<p>Static 2.</p>');
    });
});

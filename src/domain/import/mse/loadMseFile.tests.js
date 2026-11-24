import { parseMse } from './loadMseFile.js';

describe('parseMse', () => {
    it('should parse simple values', () => {
        const obj = parseMse('hello: world\n');
        expect(obj).toBeDefined();
        expect(obj.hello).toBe('world');
    });

    it('should parse blank values as null', () => {
        const obj = parseMse('test:\nvalue:\n');
        expect(obj).toBeDefined();
        expect(obj.test).toBe(null);
        expect(obj.value).toBe(null);
    });

    it('should parse objects', () => {
        const obj = parseMse(
            'colors:\n'
            + '\tred: #f00\n'
            + '\tgreen: #0f0\n'
            + '\tblue: #00f\n'
        );
        expect(obj.colors).toBeDefined();
        expect(obj.colors.red).toBe('#f00');
        expect(obj.colors.green).toBe('#0f0');
        expect(obj.colors.blue).toBe('#00f');
    });

    it('should parse arrays', () => {
        const obj = parseMse(
            'include_file: card blue rabbit\n'
            + 'include_file: card red turtle\n'
            + 'include_file: card green vulture\n'
            + 'include_file: card pink frog\n'
        );
        expect(obj.include_file).toBeDefined();
        expect(obj.include_file.length).toBe(4);
        expect(obj.include_file[0]).toBe('card blue rabbit');
        expect(obj.include_file[1]).toBe('card red turtle');
        expect(obj.include_file[2]).toBe('card green vulture');
        expect(obj.include_file[3]).toBe('card pink frog');
    });

    it('should parse multiline text', () => {
        const obj = parseMse(
            'rules_text:\n'
            + '\tThis is some rules text\n'
            + '\t\n'
            + '\tTrample, flying, first strike'
        );
        expect(obj.rules_text).toBeDefined();
        expect(obj.rules_text).toBe(
            'This is some rules text\n'
            + '\n'
            + 'Trample, flying, first strike'
        );
    });

    it('should parse as multiline text when later lines are value only', () => {
        const obj = parseMse(
            'rules_text:\n'
            + '\tT: Add {G}.\n'
            + '\t\n'
            + '\tWhenever you'
        );
        expect(obj.rules_text).toBeDefined();
        expect(obj.rules_text).toBe(
            'T: Add {G}.\n'
            + '\n'
            + 'Whenever you'
        );
    });

    it('should parse as multiline text when first lines are value only', () => {
        const obj = parseMse(
            'rules_text:\n'
            + '\tWhenever you\n'
            + '\t\n'
            + '\tT: Add {G}.\n'
        );
        expect(obj.rules_text).toBeDefined();
        expect(obj.rules_text).toBe(
            'Whenever you\n'
            + '\n'
            + 'T: Add {G}.'
        );
    });

    it('should parse ambiguous multiline text as object', () => {
        const obj = parseMse(
            'ambiguous:\n'
            + '\tT: Add {G}.\n'
        );
        expect(obj.ambiguous.T).toBeDefined();
        expect(obj.ambiguous.T).toBe('Add {G}.');
    });

    it('should not rollup unnested', () => {
        const obj = parseMse(
            'multiline:\n'
            + '\texample\n'
            + '\texample\n'
            + '\texample\n'
            + 'hello: world\n'
        );
        expect(obj.multiline).toBeDefined();
        expect(obj.multiline).toBe(
            'example\nexample\nexample'
        );
        expect(obj.hello).toBeDefined();
        expect(obj.hello).toBe('world');
    });

    it('should attach over-indented continuation lines to the preceding key', () => {
        const obj = parseMse(
            'styling:\n'
            + '\tframe:\n'
            + '\t\toverlay: none\n'
            + 'card:\n'
            + '\tname: First\n'
            + '\tillustrator:\n'
            + '\t\t\tKKPCW: Wikimedia\n'
            + '\t\t\tCommons\n'
            + '\tpower: 4\n'
            + 'card:\n'
            + '\tname: Second\n'
        );
        expect(obj.styling.frame.overlay).toBe('none');
        expect(obj.card.length).toBe(2);
        expect(obj.card[0].illustrator).toBe('KKPCW: Wikimedia\nCommons');
        expect(obj.card[0].power).toBe('4');
        expect(obj.card[1].name).toBe('Second');
    });
});

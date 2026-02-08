import { getTarget } from './target.js';
import ReminderTextContext from './RTTemplateScope.js';

// Keyword Class should have:
// serialize and deserialize template expression

export default class Keyword {
    #regularExpression;

    constructor({ label, expression, reminderTexts }) {
        this.label = label;
        this.expression = expression;
        this.reminderTexts = reminderTexts;
    }

    get regularExpression() {
        return this.#regularExpression ??= this.genRegularExpression();
    }

    genRegularExpression() {
        let match = '';

        for (const token of this.expressionTokens) {
            const paramType = getParamType(token.format);
            const paramExpr = paramType.expr?.source;

            match += `(${paramExpr || token.variable})`;
        }

        return new RegExp(match, 'i');
    }

    match(paragraphText, card) {
        const match = this.regularExpression.match(paragraphText);
        if (!match) return;
        const target = getTarget(paragraphText, this, card);
        return new ReminderTextContext(this, match, card, target);
    }
}
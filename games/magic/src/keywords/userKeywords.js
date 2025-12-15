export function newUserKeyword() {
    return {expression: "", reminderTexts: [{}], alias: ""};
}

export function generateUserKeywordsForm(userKeywords) {
    const L = localize('game-magic');

    const form = {
        id: "userKeyword",
        label: L`Current User Keyword`,
        options: []
    };

    for (const userKw of userKeywords) {
        form.options.push({id: 'test', name: 'test'});
    }
    console.log('f', form);
    return form;
}
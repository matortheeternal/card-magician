/// <reference path="../../dist/card-magician-testing.d.ts" />
/* global cmTest, document */

/** @type {Promise<HTMLElement>} */
const settings = cmTest.openSettings();
/** @type {Promise<string>} */
const value = cmTest.eventually(async () => 'ready', { timeout: 100, interval: 5 });
void settings;
void value;
cmTest.click(document.querySelector('button'));
cmTest.closeSettings();

// @ts-expect-error The supported API does not expose internal project helpers.
cmTest.createTestProject();
// @ts-expect-error Polling options must use numeric durations.
cmTest.eventually(() => true, { timeout: 'slow' });

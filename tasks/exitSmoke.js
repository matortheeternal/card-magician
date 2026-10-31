import { runExitSmokeTests } from './dev/exitSmoke.js';

runExitSmokeTests().catch(error => {
    console.error(error);
    process.exitCode = 1;
});

import { build } from './build.js';

build({ minify: true }).catch(error => {
    console.error(error);
    process.exit(1);
});

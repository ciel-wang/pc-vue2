let s = process.argv[2];
let {mode} = require('./src/config/env-mode.js')

let item = mode.hasOwnProperty(s) ? mode[s] : {}
process.env = {
    ...process.env,
    ...item
}
const shell = require('shelljs');
shell.exec('vue-cli-service build --mode production');

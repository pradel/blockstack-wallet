// Polyfills
global.Buffer = require('buffer').Buffer;
global.process.nextTick = setImmediate;

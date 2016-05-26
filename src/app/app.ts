console.log('app.ts running...');

import { Test1 } from './test/test-1';
let t1: Test1 = new Test1();
console.log('t1.name:', t1.name);

import * as trx from './test/test-rx';
console.log('trx:', trx);
console.log('test-rx.ts running...');

import { Observable } from 'rxjs/Rx';

Observable.range(1, 5).subscribe(value => console.log(value));
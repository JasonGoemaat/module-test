1. Created `src/app` folder with `app.ts`
2. npm installed `typescript` and `typings`
3. `export PATH=/c/git/web/module-test/node_modules/.bin:$PATH`
4. Create tsconfig.json:


    {
        "compilerOptions": {
        "target": "es5",
        "module": "commonjs",
        "moduleResolution": "node",
        "sourceMap": true,
        "emitDecoratorMetadata": true,
        "experimentalDecorators": true,
        "removeComments": false,
        "noImplicitAny": false,
        "outDir": "dist/app"
      },
      "exclude": [
        "node_modules",
        "dist"
      ]
    }

## Typings


## Rxjs

    import { Observable } from 'rxjs/Rx';
    Observable.range(1, 5).subscribe(value => console.log(value));
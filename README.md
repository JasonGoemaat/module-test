# Tag: 0.1

1. Created `src/app` folder with `app.ts`
2. npm installed `typescript` and `typings`
3. `export PATH=/c/git/web/module-test/node_modules/.bin:$PATH` so I could use local typescript/typings
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

5. Now I can run 'tsc' from the root and 

# Tag: 0.2

1. Added `src/app/test/test-1.ts`:

        console.log('test-1.ts running...');

        export class Test1 {
            name: string = "Test1";
        }

2. Called it from `src/app/app.ts`:

        console.log('app.ts running...');

        import { Test1 } from './test/test-1';

        let t1: Test1 = new Test1();
        console.log('t1.name:', t1.name);

This causes an error because I'm only loading `app.js`.  So I 
add SystemJS from CDN and try to import:

    <script src="//cdnjs.cloudflare.com/ajax/libs/systemjs/0.19.29/system.js" type="text/javascript"></script>

    <script type="text/javascript">
        System.import("app/app.js");
    </script>
    
This causes an error because it is looking for '/app/test/test-1' with no extension.
So I have to configure that package to use the `.js` extension, and just import 'app/app' without
the extension:

      var config = {
        packages: {
          'app': { defaultExtension: 'js' }
        }
      };
      System.config(config);
      System.import("app/app");

Now because of the 'package' definition, I ***think*** that anything starting with 'app/' 
will use that?  Here is what `System._loader.modules` has for my two files:

    http://localhost:3000/app/app.js
    http://localhost:3000/app/test/test-1.js

I think that since `app.ts` uses a relative path, it just tries to find `test-1` in a relative
location, and since that location begins with `/app` (not counting browser head?) that it
uses the package config saying the defaultExtension is 'js'.

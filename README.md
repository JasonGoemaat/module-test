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

# SystemJS

Check out the `config.js` file in the `dist` folder to see 5 different ways of loading
rxjs using SystemJS.  

First we need to configure our app.  The compiled javascript is in the `dist/app` folder.
We are serving the `dist` folder as our website, so the 'app' folder would count as a 
package in SystemJS.  This will make it so the relative import of `./test/test-1` will
find the javascript file `dist/app/test/test-1.js`:

    config.packages['app'] = { defaultExtension: 'js' };

Then note in the index there are some polyfills and SystemJS being loaded.

Now we have 5 options for loading rxjs.  NOTE: The specific version 5.0.0-beta.6 is
required, they split out a module in 5.0.0-beta.8 at least that I can't get to work.
I start by setting up a `config` object that I can modify before passing to 
`System.config` later:

    var config = {
        packages: { },
        map: { },
        paths: { },
        bundles: { } 
    };

Now our typescript files are importing `Observable` from `'rxjs/Rx'`.  This means
that SystemJS will be looking for `/rxjs/Rx`.  Typescript finds this using the
'node' module resolution method

### Option 1: Copying from node_modules

First, copy the `node_modules/rxjs` directory to `dist/lib/rxjs`.  This will
give us access to these files in the browser because we are serving the `dist`
directory.  To get to it in the browser will be `/lib/rxjs`.   So for SystemJS
to find our import it will be looking for '/rxjs/Rx'.  We need to map it:

    config.map['rxjs'] = 'lib/rxjs';

Now when SystemJS looks for 'rxjs/' and anything, it will map the request to
`/lib/rxjs` when requesting a file in the browser.  Now when we import
`rxjs/Rx` in typescript, what we are really looking for is the  code file.  To
tell SystemJS we are looking for those javascript files we need to setup the 
package:

    config.packages['rxjs'] = { defaultExtension: 'js' };

### Option 2: using a CDN serving the individual files

Rxjs is [available][unpkg-rxjs] on unpkg.  You we can configure the *path*
using SystemJS so that anything trying to to go to anything under `rxjs` using
wildcards will instead go to any other location we want, either on our server
or on the web. 

  [unpkg-rxjs]: https://unpkg.com/rxjs@5.0.0-beta.6
  
    config.paths['rxjs/*'] = 'https://unpkg.com/rxjs@5.0.0-beta.6/*';

This tells SystemJS that any requests in the path starting with `rxjs` should
get re-routed to the cdn.  Since we import 'rxjs/Rx', this will equate to
`https://unpkg.com/rxjs@5.0.0-beta.6/Rx`.  unpkg displays the 'js' files
if there is no extension, what you are actually getting is 'Rx.js' from the
node module.  Check your network tab in your browser's dev tools to see the
requests and the actual urls received.  If we *wanted* to we could set
the `defaultExtension` and use 'map' instead of 'path' and all those requests
would be to 'js' files on the cdn.  I'm not sure exactly what the difference
between setting up a map and packages is, but packages doesn't seem to be
used with 'paths':

    config.map['rxjs'] = 'https://unpkg.com/rxjs@5.0.0-beta.6/';
    config.packages['rxjs'] = { defaultExtension: 'js' };

### Option 3: Script tag

If we add a script tag for the module bundle, we don't need to configure it
in SystemJS.  Add the script tag ***AFTER*** the script tag loading SystemJS:

    <script src="https://unpkg.com/rxjs@5.0.0-beta.6/bundles/Rx.js""></script>
    
How does SystemJS know to look there when we ask for 'rxjs/Rx'?  If you look
at the module source, you'll see the path is registered for each of the
components:

    System.register("rxjs/Rx", ["rxjs/Subject", ...

### Option 4: SystemJS loaded bundle

This works because the require statements are looking for 'rxjs/Rx',
and the bundles directory on the cdn has an 'Rx.js' file for the bundle.
I'm not sure how well this translates to other modules besides rxjs.  I'm 
assuming that when we import from 'rxjs/Rx', this looks for and finds
that bundle and runs it, thereby registering all the components inside
as if it were included in a script tag.  I'm not sure this is the best way
to do it...

    config.paths['rxjs/*'] = 'https://unpkg.com/rxjs@5.0.0-beta.6/bundles/*';

### Option 5: SystemJS configured bundle

The `bundles` config property is opposite from the others.  The key is
the path to the bundle file, and the value is an array of modules provided
by the bundle.  All this does is make SystemJS load and execute the bundle
before requests to any of those modules is made, so the bundle registers 
it's own components in the correct (we hope) paths.

    //config.bundles['https://unpkg.com/rxjs@5.0.0-beta.6/bundles/Rx.js'] = ['/rxjs/Rx']; // remote
    config.bundles['lib/rxjs/bundles/Rx.js'] = ['rxjs/*']; // local wildcard

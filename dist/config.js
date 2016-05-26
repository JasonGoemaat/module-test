(function(global) {

var config = {
  packages: { },
  map: { },
  paths: { },
  bundles: { } 
};

//---------------------------------------------------------------------
// OUR APP
//---------------------------------------------------------------------

// configure our app...
// 1) packages['app'] says default extensions is 'js', so when we try to find
//    "app/test/test-1", we really end up getting "app/test/test-1.js"
//
config.packages['app'] = { defaultExtension: 'js' };

//---------------------------------------------------------------------
// RXJS
//---------------------------------------------------------------------

// OPTION 1: Copy of node_modules/rxjs
// configure rxjs to use the 'node_modules/rxjs' folder copied to the
// web sites 'lib' folder.  We also need to tell it to use the default
// extension of 'js'.  This is so when we do this:
//      import { Observable } from 'rxjs/Rx'
// SystemJS will try to find 'lib/rxjs/Rx.js'.  The mapping moves the location
// and the package declaration gives us the extension
// config.map['rxjs'] = 'lib/rxjs';
// config.packages['rxjs'] = { defaultExtension: 'js' };

// OPTION 2: CDN of individual files 
// instead of using local, we could just set the path!  Note the *
// after BOTH paths.  I am not sure why this doesn't require
// 'defaultExtension' in the packages config?  Ah, I see.  If your
// just go to '/Rx', it returns the Rx.js file.  And the require
// statements in them don't have extensions, and the urls that
// are requested don't have extensions, and the site returns the
// right content without an extension:
//        var Observable_1 = require('./Observable'); // returns Observable.js
//        exports.Observable = Observable_1.Observable;
//config.paths['rxjs/*'] = 'https://npmcdn.com/rxjs@5.0.0-beta.6/*';
// ALTERNATE:  use map and 'defaultExtension' to use '.js' on the url 
//config.map['rxjs'] = 'https://npmcdn.com/rxjs@5.0.0-beta.6/';
//config.packages['rxjs'] = { defaultExtension: 'js' };

// OPTION 3: SCRIPT TAG
// Add this script tag to your HTML.  It will load the 'bundle'
// of rxjs and not require SystemJS to do anything.  SystemJS must
// detect modules created this way?  LOOK IN THE HTML FOR THIS, IT
// IS COMMENTED OUT AND MUST BE AFTER SystemJS!
// <script src="https://npmcdn.com/rxjs@5.0.0-beta.6/bundles/Rx.js" type="text/javascript"></script>

// OPTION 4: SystemJS loaded bundle 
// This works because the require statements are looking for 'rxjs/Rx',
// and the bundles directory on the cdn has an 'Rx.js' file for the bundle.
// I'm not sure how well this translates to other modules besides rxjs.
//config.paths['rxjs/*'] = 'https://npmcdn.com/rxjs@5.0.0-beta.6/bundles/*';

// OPTION 5: SystemJS configured bundle
// Here I'm trying to something special - going to 
// put this in html:
//      System.load('https://npmcdn.com/rxjs@5.0.0-beta.6/bundles/Rx.js')
// That didn't work, though it added the module to System._loader.modules with
// the full url.  Trying to config 'bundles'...  This works!  It's backwards
// from the other config options, it actually takes the bundle as the key
// and an array of modules that are in the bundle as the value.
//config.bundles['https://npmcdn.com/rxjs@5.0.0-beta.6/bundles/Rx.js'] = ['/rxjs/Rx']; // remote
config.bundles['lib/rxjs/bundles/Rx.js'] = ['rxjs/*']; // local

// filterSystemConfig - index.html's chance to modify config before we register it.
if (global.filterSystemConfig) { global.filterSystemConfig(config); }

System.config(config);

})(this);


// NOTE: rxjs-5.0.0-beta.8 is broken.  It requires
// new 'symbol-observable' required by "rxjs 5.0.0-beta.8", apparently it
// used to be part of rxjs and they split it out.  Here we can set the
// path to use a cdn, but this doesn't work, some ponyfill is required
// and I don't know where that is
//config.paths["symbol-observable"] = 'https://npmcdn.com/symbol-observable@0.2.4'


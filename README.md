# fuse-box-ng-template-plugin [![](https://img.shields.io/npm/dm/fuse-box-ng-template-plugin.svg?style=flat)](https://www.npmjs.org/package/fuse-box-ng-template-plugin) [![npm version](https://badge.fury.io/js/fuse-box-ng-template-plugin.svg)](https://www.npmjs.com/package/fuse-box-ng-template-plugin) [![Build Status](https://img.shields.io/travis/TobiasTimm/fuse-box-ng-template-plugin/master.svg)](https://travis-ci.org/TobiasTimm/fuse-box-ng-template-plugin)

> AngularJS template plugin for [FuseBox](https://github.com/fuse-box/fuse-box)

Includes your AngularJS templates into your fuse-box bundle. Pre-loads the AngularJS template cache to remove initial load times of templates.

Inspired by [ngtemplate-loader](https://github.com/WearyMonkey/ngtemplate-loader)

## Install

With `npm`

```shell
npm install --save-dev fuse-box-ng-template-plugin
```

With `yarn`

```shell
yarn add --dev fuse-box-ng-template-plugin
```

## Usage

Just call `NgTemplatePlugin` within the FuseBox plugins array.

```js
const { FuseBox } = require("fuse-box");
const NgTemplatePlugin = require("fuse-box-ng-template-plugin");

const fuse = FuseBox.init({
  homeDir: "./src",
  plugins: [NgTemplatePlugin()]
});
```

`NgTemplatePlugin` will export the path of the HTML file, so you can use `require` / `import` within your AngularJS code.

```js
import templateUrl from "./test.html";

app.directive("testDirective", () => {
  return {
    restrict: "E",
    templateUrl
  };
});
```

## Configuration

### `relativeTo` and `prefix`

You can set the base path of your templates using `relativeTo` and `prefix` parameters. `relativeTo` is used
to strip a matching prefix from the absolute path of the input html file. `prefix` is then appended to path.

The prefix of the path up to and including the first `relativeTo` match is stripped, e.g.

```js
NgTemplatePlugin({
  relativeTo: "/src/"
});
```

`'/test/src/test.html'` will be stripped to `'test.html'` within the `$templateCache`.

To match from the start of the absolute path prefix a `'//'`, e.g.

```js
NgTemplatePlugin({
  relativeTo: "//Users/fuse-box/project/test/"
});
```

It will be stripped to `'src/test.html'` within the `$templateCache`.

You can combine `relativeTo` and `prefix` to replace the prefix in the absolute path, e.g.

```js
NgTemplatePlugin({
  relativeTo: "src/",
  prefix: "build/"
});
```

`'/test/src/test.html'` will be transformed to `'build/test.html'`.

### `module`

By default `NgTemplatePlugin` adds a run method to the global 'ng' module, which does not need to be explicitly required by your app.

You can override this by setting the `module` parameter, e.g.

```javascript
NgTemplatePlugin({
  module: "myTemplates"
});

// => returns the javascript:
angular.module("myTemplates").run([
  "$templateCache",
  function(c) {
    c.put("file.html", "<file.html processed by html-loader>");
  }
]);
```

> Please make sure the specified module is initialized within your code.

## HMR

By default the built-in `FuseBox` hmr does not work with AngularJS, but you can write a custom hmr plugin within your code.

For an example implementation, have a look at the [AngularJS example](https://github.com/TobiasTimm/fuse-box-angularjs-example).

Otherwise please force a reload within your `fuse.js`

```js
app.hmr({
  reload: true
});
```

## License

[MIT](./LICENSE)

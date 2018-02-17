import { WorkFlowContext, File } from "fuse-box";
// tslint:disable-next-line:no-implicit-dependencies
import { NgTemplatePlugin, NgTemplatePluginClass } from "./NgTemplatePlugin";

describe("NgTemplatePlugin", () => {
  let plugin: NgTemplatePluginClass;

  beforeEach(() => {
    plugin = NgTemplatePlugin();
  });

  describe("Initialization", () => {
    it("should be defined", () => {
      expect(plugin).toBeDefined();
    });

    it("should expose required plugin members/methods", () => {
      expect(plugin.init).toBeDefined();
      expect(plugin.transform).toBeDefined();
      expect(plugin.test).toBeDefined();
    });
  });

  describe("transform", () => {
    it("should transform the html into an js module", () => {
      const file = createFuseFileMock("<div>Hello World!</div>", "test.html");
      plugin.transform(file);
      expect(file.contents).toMatch(`"use strict";

    var angular = require("angular");
    var path = "test.html";
    var html = '<div>Hello World!</div>';
    angular.module("ng").run(["$templateCache", function(c) { c.put(path, html); }]);
    module.exports.default = path;
    `);
    });

    it("should also transform multi-line html", () => {
      const file = createFuseFileMock(
        `<div>
        <p>My Label</p>
      </div>`,
        "multi-line.html"
      );
      plugin.transform(file);
      expect(file.contents).toMatch(`"use strict";

    var angular = require("angular");
    var path = "multi-line.html";
    var html = '<div>        <p>My Label</p>      </div>';
    angular.module("ng").run(["$templateCache", function(c) { c.put(path, html); }]);
    module.exports.default = path;
    `);
    });

    it("should escape single quotes in html", () => {
      const file = createFuseFileMock(
        `<div ng-include="'myComponent.html'"></div>`,
        "single-quotes.html"
      );
      plugin.transform(file);
      expect(file.contents).toMatch(`"use strict";

    var angular = require("angular");
    var path = "single-quotes.html";
    var html = '<div ng-include="\\'myComponent.html\\'"></div>';
    angular.module("ng").run(["$templateCache", function(c) { c.put(path, html); }]);
    module.exports.default = path;
    `);
    });
  });
});

function createFuseFileMock(contents, fuseBoxPath) {
  const FuseFileMock = jest.fn<File>(() => ({
    contents,
    context: jest.fn<WorkFlowContext>(() => ({
      useCache: false
    })),
    info: {
      fuseBoxPath
    },
    loadContents: jest.fn()
  }));
  return new FuseFileMock();
}

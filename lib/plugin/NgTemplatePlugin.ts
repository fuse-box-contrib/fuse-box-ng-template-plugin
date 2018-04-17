import * as path from "path";
import { Plugin, WorkFlowContext, File } from "fuse-box";

import { isWindows, escapeRegExp } from "../util";

export interface NgTemplatePluginOptions {
  ext?: string;
  ngModule?: string;
  prefix?: string;
  relativeTo?: string;
}

export class NgTemplatePluginClass implements Plugin {
  public test: RegExp = /\.html$/;

  private absolute: boolean = false;
  private ext: string;
  private ngModule: string;
  private prefix: string;
  private relativeTo: string;
  private delimiter = "\n";

  constructor(opts: NgTemplatePluginOptions) {
    this.ext = opts.ext;
    this.ngModule = opts.ngModule;
    this.prefix = opts.prefix;
    this.relativeTo = opts.relativeTo;
  }

  public init(context: WorkFlowContext) {
    context.allowExtension(this.ext);
  }

  public transform(file: File) {
    const relativeTo = this.getRelativePath();

    const filePath = file.info.fuseBoxPath;

    const context = file.context;
    if (context.useCache) {
      const cached = context.cache.getStaticCache(file);
      if (cached) {
        file.isLoaded = true;
        file.contents = cached.contents;
        return;
      }
    }
    file.loadContents();

    let html;
    const content = file.contents;

    if (content.match(/^module\.exports/)) {
      const firstQuote = this.findQoute(content, false);
      const secondQuote = this.findQoute(content, true);
      html = content.substr(firstQuote, secondQuote - firstQuote + 1);
    } else {
      html = content;
    }

    file.contents = `"use strict";

    var angular = require("angular");
    var path = "${this.getFilePath(file.info.fuseBoxPath, this.relativeTo)}";
    var html = '${html
      .split(/[\r\n]+/)
      .join("")
      .replace(/'/g, "\\'")}';
    angular.module("${
      this.ngModule
    }").run(["$templateCache", function(c) { c.put(path, html); }]);
    module.exports.default = path;
    `;

    if (context.useCache) {
      context.emitJavascriptHotReload(file);
      context.cache.writeStaticCache(file, file.sourceMap);
    }
  }

  private getRelativePath(): string {
    if (this.relativeTo[0] === "/") {
      if (isWindows()) {
        return this.relativeTo.substring(1);
      } else if (this.relativeTo[1] === "/") {
        this.absolute = true;
        return this.relativeTo.substring(1);
      }
    }
  }

  private findQoute(content, backwards) {
    let i = backwards ? content.length - 1 : 0;
    while (i >= 0 && i < content.length) {
      if (content[i] === '"' || content[i] === "'") {
        return i;
      }
      i += backwards ? -1 : 1;
    }
    return -1;
  }

  private getFilePath(fuseFilePath: string, relativeTo: string): string {
    const relativeToFuseFilePath = fuseFilePath.indexOf(relativeTo);
    if (
      relativeToFuseFilePath === -1 ||
      (this.absolute && relativeToFuseFilePath !== 0)
    ) {
      throw new Error("The path for file doesn't contain relativeTo param");
    }
    return [
      this.prefix,
      fuseFilePath.slice(relativeToFuseFilePath + relativeTo.length)
    ]
      .filter(Boolean)
      .join(path.sep)
      .replace(new RegExp(escapeRegExp(path.sep) + "+", "g"), path.sep);
  }
}

export function NgTemplatePlugin(
  options: NgTemplatePluginOptions = {
    ext: ".html",
    ngModule: "ng",
    prefix: "",
    relativeTo: ""
  }
) {
  return new NgTemplatePluginClass(options);
}

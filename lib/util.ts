import * as path from "path";

const pathSepRegex = new RegExp(escapeRegExp(path.sep), "g");

export function escapeRegExp(regExp: string): string {
  return regExp.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

export function isWindows(): boolean {
  return path.sep === "\\";
}

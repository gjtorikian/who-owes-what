import winston = require("winston");
import { Package } from "./entities";

const fs = require("fs");

const HEADER = "type,package,source,dependent,url";

export class Format {
  logger: winston.Logger;

  packages: Package[];

  constructor(logger: winston.Logger, packages: Package[]) {
    this.logger = logger;
    this.packages = packages;
  }

  async csv() {
    let output: string[];
    output = [HEADER];
    for (const pkg of this.packages) {
      for (const dependent of pkg.dependents) {
        output.push(
          `${pkg.type},${pkg.name},${pkg.source},${dependent.name},${dependent.url}`
        );
      }
    }

    fs.writeFileSync("output.csv", output.join("\n"));

    console.log(output.join("\n"));
  }
}

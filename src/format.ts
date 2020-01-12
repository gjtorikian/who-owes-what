import winston = require('winston');
import {Package} from './entities'

const HEADER = 'package,dependent,url'

export class Format {
  logger: winston.Logger;

  packages: Package[];

  constructor(logger: winston.Logger, packages: Package[]) {
    this.logger = logger
    this.packages = packages
  }

  async csv() {
    let output: string[]
    output = [HEADER]
    for (const pkg of this.packages) {
      for (const dependent of pkg.dependents) {
        output.push(`${pkg.name},${dependent.name},${dependent.url}`)
      }
    }
    console.log(output.join('\n'))
  }
}

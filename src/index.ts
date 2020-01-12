import {Command, flags} from '@oclif/command'
import {NPM} from './npm'

import {Package} from './entities'
import {Format} from './format'

import winston = require('winston');

class WhoOwesWhat extends Command {
  static description = 'List the major dependents of your packages';

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({char: 'v'}),
    help: flags.help({char: 'h'}),
    owner: flags.string({
      char: 'o',
      description: 'The package registry owner',
      required: true,
    }),
    source: flags.string({
      char: 's',
      description: 'The package registry source',
      required: true,
      options: ['npm'],
    }),
    token: flags.string({
      char: 't',
      description: 'The package registry token',
    }),
    timeframe: flags.string({
      char: 'f',
      description: 'Sets the length of time',
      default: '6M',
    }),
    debug: flags.boolean({
      char: 'd',
      description: 'Enables a more verbose debug mode',
    }),
  };

  async run() {
    const {flags} = this.parse(WhoOwesWhat)
    const {owner, debug, timeframe} = flags

    const level = debug ? 'debug' : 'info'
    const logger = winston.createLogger({
      level: level,
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
      transports: [new winston.transports.Console()],
    })

    const timematch = timeframe.match(/\d+(\S)/) || ''
    if (timematch === null || !/[yMwd]/.test(timematch[1])) {
      logger.error(
        `Sorry, \`${timeframe}\` does not match the timeframe pattern`
      )
      return
    }

    let packages: Package[]
    packages = []

    switch (flags.source) {
    case 'npm': {
      logger.info(
        `Excellent. Fetching ${owner}'s packages from npmjs.com...`
      )
      packages = await new NPM(logger, timeframe, owner).execute()
      break
    }
    }

    new Format(logger, packages).csv()
  }
}

export = WhoOwesWhat;

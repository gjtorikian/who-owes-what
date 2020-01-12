import winston = require("winston");

import * as moment from "moment";

import { Package, Dependent } from "./entities";
import axios from "axios";

const RUBY_GEMS_API_ROOT = "https://rubygems.org/api/v1";
const RUBY_PACKAGE = "https://rubygems.org/gems";

export class RubyGems {
  logger: winston.Logger;
  deadline: moment.Moment;
  owner: string;

  constructor(logger: winston.Logger, timeframe: string, owner: string) {
    this.logger = logger;

    this.deadline = moment().subtract(
      parseInt(timeframe[0], 10),
      timeframe[1] as moment.DurationInputArg2
    );

    this.owner = owner;
  }

  async execute(): Promise<Package[]> {
    let gemURL = `${RUBY_GEMS_API_ROOT}/owners/${this.owner}/gems.json`;
    this.logger.debug(`Fetching ${gemURL}`);
    const gemResponse = await axios.get(gemURL);
    const gems = gemResponse.data;
    const gemsCount = gems.length;

    let packages: Package[];
    packages = [];

    if (gemsCount > 1) {
      this.logger.info(`Found ${gemsCount} Ruby gems`);
    } else if (gemsCount === 1) {
      this.logger.info(`Found ${gemsCount} Ruby gem`);
    } else {
      this.logger.info("No Ruby gems found");
      return [];
    }

    for (const gem of gems) {
      const name = gem.name;
      this.logger.info(`Analyzing ${name}`);
      let reverseDependentsURL = `${RUBY_GEMS_API_ROOT}/gems/${name}/reverse_dependencies.json`;
      const reverseDependentsResponse = await axios.get(reverseDependentsURL);
      const reverseDependents = reverseDependentsResponse.data;
      const reverseDependentsCount = reverseDependents.length;

      let dependents: Dependent[];
      dependents = [];

      if (reverseDependentsCount === 0) {
        this.logger.info("No dependents found");
        dependents.push({ name: "", url: "" });
      } else {
        if (reverseDependentsCount > 1) {
          this.logger.info(`${reverseDependentsCount} dependents found`);
        } else {
          this.logger.info(`${reverseDependentsCount} dependent found`);
        }
        for (const reverseDependent of reverseDependents) {
          const dependent: Dependent = {
            name: reverseDependent,
            url: `${RUBY_PACKAGE}/${reverseDependent}`
          };
          dependents.push(dependent);
        }
      }

      packages.push({
        name: name,
        type: "rubygems",
        source: `${RUBY_PACKAGE}/${name}`,
        dependents: dependents
      });
    }

    return packages;
  }
}

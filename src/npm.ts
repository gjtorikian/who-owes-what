import winston = require("winston");
const NpmApi = require("npm-api");

import { Package, Dependent } from "./entities";

import axios from "axios";
import * as cheerio from "cheerio";
import * as moment from "moment";

const NPM_ROOT = "https://www.npmjs.com";
const NPM_PACKAGE = "https://www.npmjs.com/package/";

export class NPM {
  logger: winston.Logger;

  deadline: moment.Moment;

  owner: string;

  npm: any;

  constructor(logger: winston.Logger, timeframe: string, owner: string) {
    this.logger = logger;

    this.deadline = moment().subtract(
      parseInt(timeframe[0], 10),
      timeframe[1] as moment.DurationInputArg2
    );

    this.owner = owner;
    this.npm = new NpmApi();
  }

  async execute(): Promise<Package[]> {
    const maintainer = this.npm.maintainer("gjtorikian");
    const repos = await maintainer.repos();
    const repoCount = repos.length;
    if (repoCount > 1) {
      this.logger.info(`Found ${repoCount} NPM packages`);
    } else if (repoCount === 1) {
      this.logger.info(`Found ${repoCount} NPM package`);
    } else {
      this.logger.info("No NPM packages found");
      return [];
    }

    let packages: Package[];
    packages = [];

    for (const repo of repos) {
      this.logger.info(`Analyzing ${repo}`);
      let dependents: Dependent[];
      dependents = [];
      await this.fetchDependents(
        `${NPM_ROOT}/browse/depended/${repo}`,
        dependents
      );
      const dependentsCount = dependents.length;

      if (dependentsCount === 0) {
        this.logger.info("No dependents found");
        dependents.push({ name: "", url: "" });
      } else if (dependentsCount > 1) {
        this.logger.info(`${dependentsCount} dependents found`);
      } else {
        this.logger.info(`${dependentsCount} dependent found`);
      }

      packages.push({
        name: repo,
        type: "npm",
        source: `${NPM_PACKAGE}${repo}`,
        dependents: dependents
      });
    }

    return packages;
  }

  private async fetchDependents(
    url: string,
    dependents: Dependent[]
  ): Promise<Dependent[]> {
    this.logger.debug(`Fetching ${url}`);
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const sections = $("main div div section");
    const sectionsCount = sections.length;

    if (sectionsCount === 0) {
      return dependents;
    }

    $(sections).each((_, s) => {
      const section = $(s).children("div")[1]; // get actual section div
      const name = $(section)
        .find("div a h3")
        .text();
      const title = $(section)
        .find("div div span")
        .attr("title");

      // npm page shows times as one blob:
      // Fri Oct 18 2019 20:16:10 GMT+0000 (UTC)and Latest Version
      const times = (title || "").split(" ", 4);
      const date = moment(`${times[1]} ${times[2]} ${times[3]}`, "MMM DD YYYY");
      if (date >= this.deadline) {
        const dependent: Dependent = {
          name: name,
          url: `${NPM_PACKAGE}${name}`
        };
        dependents.push(dependent);
      }
    });

    const hasNextPage = $("a")
      .filter((_, anchor) => {
        return (
          $(anchor)
            .text()
            .trim() === "Next Page"
        );
      })
      .first()
      .attr("href");

    if (hasNextPage) {
      const nextPage = `${NPM_ROOT}${hasNextPage}`;
      return this.fetchDependents(nextPage, dependents);
    }
    return dependents;
  }
}

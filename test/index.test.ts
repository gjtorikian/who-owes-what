import {expect, test} from '@oclif/test'

import cmd = require('../src');

const nock = require('nock')
nock.disableNetConnect()
describe('who-owes-what', () => {
  test
  .stdout()
  .do(() => cmd.run(['--owner', 'gjtorikian', '--source', 'npm', '-f', '3x']))
  .it('does not accept bogus timeframes', ctx => {
    expect(ctx.stdout).to.contain('does not match the timeframe pattern')
  })

  // test
  //   .stdout()
  //   .do(() => cmd.run(["--owner", "gjtorikian", "--source", "npm"]))
  //   .it("scrapes npm", ctx => {
  //     nock("registry.npmjs.org:443")
  //       .get("/-/v1/search?text=maintainer:gjtorikian&size=250")
  //       .reply(200, "Hello from Google!");

  //     expect(ctx.stdout).to.contain("hello world");
  //   });
})

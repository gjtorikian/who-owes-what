# who-owes-what

I got tired of seeing big corporations (GitHub, Google, Microsoft, Salesforce) using my open source software without sponsoring. I wrote this little CLI to detect major dependents with their points of contact, so that I could ask them for funds.

Also, I wanted to try a Typescript project.

## Usage

```
List the major dependents of your packages

USAGE
  $ who-owes-what

OPTIONS
  -d, --debug                    Enables a more verbose debug mode
  -f, --timeframe=timeframe      [default: 6M] Sets the length of time
  -h, --help                     show CLI help
  -o, --owner=owner              (required) The package registry owner
  -s, --source=npm|rubygems|all  (required) The package registry source
  -v, --version                  show CLI version
```

For example:

```
bin/run --owner gjtorikian --source all
```

would list out a CSV like:

```
type,package,source,dependent,url
npm,isbinaryfile,https://www.npmjs.com/package/isbinaryfile,ember-cli,https://www.npmjs.com/package/ember-cli
...
rubygems,commonmarker,https://rubygems.org/gems/commonmarker,dependabot-common,https://rubygems.org/gems/dependabot-common
```

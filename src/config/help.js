const fs = require('fs'),
    path = require('path')

const pluckOptionsFromReadme = () => {
  const readmePath = path.join(__dirname, '..', 'README.md')
  let readmeString = fs.readFileSync(readmePath, 'utf8')
  // Everything before options
  readmeString = readmeString.replace(/[\s\S]*# Options/, '# Options')
  // And everything from the next major section onwards
  return readmeString.replace(/\n# [\s\S]*/, '')
}

module.exports = {
  outputVersion: () => {
    const package = require('../package')
    console.log(`Horticulturalist ${package.version}`)
  },
  outputHelp: () => {
    module.exports.outputVersion()
    console.log()
    console.log(pluckOptionsFromReadme())
  }
};


if (!action && !mode.daemon) {
  help.outputHelp()
  error('--no-daemon does not do anything without also specifiying an action')
  return
}

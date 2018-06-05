const fs = require('fs'),
    path = require('path')

const pluckOptionsFromReadme = () => {
  const readmePath = path.join(__dirname, '../..', 'README.md')
  let readmeString = fs.readFileSync(readmePath, 'utf8')
  // Everything before options
  readmeString = readmeString.replace(/[\s\S]*# Options/, '# Options')
  // And everything from the next major section onwards
  return readmeString.replace(/\n# [\s\S]*/, '')
}

const outputVersion = () => {
  const package = require('../../package')
  console.log(`Horticulturalist ${package.version}`)
}

const outputHelp = () => {
  outputVersion()
  console.log()
  console.log(pluckOptionsFromReadme())
}

module.exports = {
  outputVersion: () => outputVersion()
  outputHelp: () => outputHelp()
}

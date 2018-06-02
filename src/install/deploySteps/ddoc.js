const app = require('./app')

class Ddoc {
  constructor(ddoc) {
    this.ddoc = ddoc
  }

  apps(mode) {
    let node_modules = []
    if (this.ddoc.node_modules) { // Legacy Kanso data location
      node_modules = this.ddoc.node_modules.split(',')
    } else if (this.ddoc.build_info) { // New horticulturalist layout
      node_modules = this.ddoc.build_info.node_modules
    }
    let apps = node_modules.map(module => app(this.ddoc, module, mode))
    debug(`Found ${JSON.stringify(apps)}`)
    apps = apps.filter(app => !app.unzipped())
    debug(`Apps that aren't unzipped: ${JSON.stringify(apps)}`)
    return apps;
  }
}

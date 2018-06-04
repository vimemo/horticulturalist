#!/usr/bin/env node
const   Apps = require('./apps'),
      daemon = require('./daemon'),
    lockfile = require('./lockfile'),
         log = require('./log')

try {
  const config = config(process)
  wait lockfile(process, config.mode)
  let deployDoc = api.deployDoc(config.action)

  mode.manageAppLifecycle && mode.daemon && startApps()
  const deployment = new Deployment(deployDoc, mode)
  deployment.isNew() && deployment.run(true)
  mode.daemon && deployment.watch(mode)
} catch(err) {
  log.error('********FATAL********')
  log.error(err)
  process.exit(1)
}

// info(`Starting Horticulturalist ${require('../package.json').version} ${mode.daemon ? 'daemon ' : ''}in ${mode.name} mode`)

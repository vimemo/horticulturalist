#!/usr/bin/env node
const   Apps = require('./apps'),
      daemon = require('./daemon'),
    lockfile = require('./lockfile'),
         log = require('./log')

try {
  const config = config(process)
  wait lockfile(process, config.mode)
  let deployDoc = api.deployDoc(config.action)

  if(config.mode.manageAppLifecycle && config.mode.daemon) {
    startApps(config.mode.startCmd)
  }
  const deployment = new Deployment(deployDoc, config.mode)
  deployment.isNew() && deployment.run(true)
  config.mode.daemon && deployment.watch(config.mode)

  // clearing of the lockfile is handled by the lockfile library itself
  onExit(async (code) => {
    if(config.mode.manageAppLifecycle && config.mode.daemon){
      await stopApps(config.mode.stopCmd)
    }
    process.exit(code || 0)
  })  
} catch(err) {
  log.error('********FATAL********')
  log.error(err)
  process.exit(1)
}

// info(`Starting Horticulturalist ${require('../package.json').version} ${mode.daemon ? 'daemon ' : ''}in ${mode.name} mode`)

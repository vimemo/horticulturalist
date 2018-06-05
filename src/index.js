#!/usr/bin/env node
const    api = require('./api'),
      daemon = require('./daemon'),
    lockfile = require('./config/lockfile'),
    fatality = require('./utils/fatality'),
 { info, error } = require('./log')

const run = async () => {
  try {
    const config = new Config()
    const mode = config.mode
    info(`Starting Horticulturalist ${require('../package.json').version} \
          ${mode.daemon ? 'daemon ' : ''}in ${mode.name} mode`)
    wait lockfile.wait(mode.deployments)
    const deployDoc = api.deployDoc(config.action)

    config.manageAppMode && startApps(mode.startCmd)

    const deployment = new Deployment(deployDoc, mode)
    deployment.isNew() && deployment.run(true)

    mode.daemon && deployment.watch(mode)

    // clearing of the lockfile is handled by the lockfile library itself
    onExit(async (code) => {
      config.manageAppMode && await stopApps(mode.stopCmd)
      process.exit(code || 0)
    })
  } catch(fatality)
}

await run()

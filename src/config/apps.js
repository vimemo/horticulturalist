const child_process = require('child_process')
const debug = require('./log').debug

const APPS = [ 'medic-api', 'medic-sentinel' ]

const execute = (cmd, app) => {
  cmd = cmd.map(sub => sub.replace(/{{app}}/g, app))

  return new Promise((resolve, reject) => {
    const proc = child_process.spawn(cmd.shift(), cmd, {
      stdio: [ 'ignore', process.stdout, process.stderr ],
    });
    proc.on('close', status => status
                ? reject(`${app} existed with status ${status}`)
                : resolve())
  })
}

async startApps(cmd) {
  await Promise.all(APPS.map(async (app) => {
    debug(`Starting app: ${app} with command: ${cmd}…`)
    await execForApp(cmd, app)
    debug(`Started ${app} in the background.`)
  }))

}

async stopApps(cmd) {
  await Promise.all(APPS.map(async (app) => {
    debug(`Stopping app: ${app} with command: ${cmd}…`)
    await execForApp(cmd, app)
    debug(`Stopped ${app}.`)
  }))
}

module.exports = {
  startApps: cmd => startApps(cmd),
  stopApps: cmd => stopApps(cmd)
}

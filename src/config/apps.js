const child_process = require('child_process')
const debug = require('./log').debug

const execute = (cmd) => {
  return new Promise((resolve, reject) => {
    const proc = child_process.spawn(cmd.shift(), cmd, {
      stdio: [ 'ignore', process.stdout, process.stderr ],
    });
    proc.on('close', status => status
                ? reject(`${app} existed with status ${status}`)
                : resolve())
  })
}

const APPS = [ 'medic-api', 'medic-sentinel' ]

startApps() {
  // cmd = cmd.map(sub => sub.replace(/{{app}}/g, app))
  // APPS.reduce((p, app) => p await execForApp(startCmd, app)
}

stopApps() {
}

stopAppsSync() {
  // cmd = cmd.map(sub => sub.replace(/{{app}}/g, app))
  // APPS.forEach(app => { execForApp(stopCmd, app) }
}

// debug(`Starting app: ${app} with command: ${startCmd}…`))
// debug(`Started ${app} in the background.`)),
// .then(() => debug(`Stopping app: ${app} with command: ${startCmd}…`))
// .then(() => debug(`Stopped ${app}.`)),

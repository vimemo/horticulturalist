const fs = require('fs-extra'),
      os = require('os'),
      parseArgs = require('minimist'),
      onExit = require('signal-exit')

const lockfile = require('lockfile'),
            os = require('os'),
          path = require('path')

class Lockfile {
  constructor(process, mode) {
    this.file = path.join(os.homedir(), '.horticulturalist.lock')
    this.path = path.resolve(this.file)


    if(lockfile.exists()) { throw new Error(`Lock file already exists at ${lockfile.path()}.  Cannot start horticulturalising.`) }
    process.on('uncaughtException', fatality)
    // clearing of the lockfile is handled by the lockfile library itself
    onExit((code) => {
      if(mode.manageAppLifecycle && mode.daemon){
        stopAppsSync(mode)
      }
      process.exit(code || 0)
    })
    await lockfile.wait()
    fs.mkdirs(mode.deployments)
  }

  wait() {
    new Promise((resolve, reject) => {
      lockfile.lock(LOCK_FILE, err => {
        if(err) reject(err)
        else resolve()
      })
    })
  }

  exists() {
    return lockfile.checkSync(LOCK_FILE)
  }
}

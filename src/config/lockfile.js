const lockfile = require('lockfile'),
            fs = require('fs-extra'),
            os = require('os'),
        onExit = require('signal-exit'),
          path = require('path')

const LOCK_FILE = path.join(os.homedir(), '.horticulturalist.lock');

class Lockfile {
  constructor(config) {
    if(Lockfile.exists()) {
      throw new Error(`Lock file already exists at ${Lockfile.path()}. \
                       Cannot start horticulturalising.`)
    }
    await lockfile.wait()
    fs.mkdirs(config.mode.deployments)
  }

  wait() {
    new Promise((resolve, reject) => {
      lockfile.lock(LOCK_FILE, err => {
        if(err) reject(err)
        else resolve()
      })
    })
  }

  static exists() {
    return lockfile.checkSync(LOCK_FILE)
  }

  static path() {
    return path.resolve(LOCK_FILE)
  }
}

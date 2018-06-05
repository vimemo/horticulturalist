const lockfile = require('lockfile'),
            fs = require('fs-extra'),
            os = require('os'),
        onExit = require('signal-exit'),
          path = require('path')

const LOCK_FILE = path.join(os.homedir(), '.horticulturalist.lock');

const exists = () => {
  return lockfile.checkSync(LOCK_FILE)
}

const fpath = () => {
  return path.resolve(LOCK_FILE)
}

const wait = (dir) => {
  if(exists()) {
    throw new Error(`Lock file already exists at ${fpath()}. \
                     Cannot start horticulturalising.`)
  }
  await lockfile.wait()
  await lockfile.lock(LOCK_FILE)
  fs.mkdirs(dir)
}

export = {
  wait: (dir) => wait(dir)
}

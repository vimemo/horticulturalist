const decompress = require('decompress'),
            path = require('path');

class ChangedApps {
  constructor(ddoc, mode) {
    this.ddoc = ddoc
    this.apps = ddoc.apps
    this.appsToDeploy = this.apps.length
    this.mode = mode
  }

  unzip() {
    info(`Unzipping changed apps to ${this.mode.deployments}…`, this.apps)
    await Promise.all(this.apps.map(app => {
      const attachment = this.ddoc._attachments[app.attachmentName].data
      return decompress(attachment, app.path, {
        map: file => {
          file.path = file.path.replace(/^package/, '')
          return file
        }
      })
    }))
    info('Changed apps unzipped.')
  }

  updateSymlinkAndRemoveOldVersion() {
    return Promise.all(this.apps.map(app => {
      const livePath = app.deployPath('current');

      if(fs.existsSync(livePath)) {
        const linkString = fs.readlinkSync(livePath)
        if(fs.existsSync(linkString)) {
          debug(`Deleting old ${app.name} from ${linkString}…`)
          fs.removeSync(linkString)
        } else debug(`Old app not found at ${linkString}.`)
        fs.unlinkSync(livePath)
      }

      fs.symlinkSync(app.path, livePath);
    }));
  };

}

const ChangedApps = require('./changed-apps')

module.exports = (mode, deployDoc) => {
  const processDdoc = (ddoc, firstRun) => {
    const changedApps = new ChangedApps(ddoc, mode)
    if (changedApps.appsToDeploy) {
      changedApps.unzip()
      mode.daemon && stopApps(mode)
    }
    // ===================================
    stagedDdocs.deploy()
    changedApps.appsToDeploy && await changedApp.updateSymlinkAndRemoveOldVersion()
    // ===================================

    mode.daemon && (changedApps.appsToDeploy || firstRun)) && await apps.start()
  }
}

// debug('No apps to deploy');

// info('Stopping all apps…', apps.APPS)
// info('All apps stopped.')

// info('Updating symlinks for changed apps…', changedApps.apps)
// info('Symlinks updated.')

// info('Starting all apps…', apps.APPS);
// info('All apps started.'));

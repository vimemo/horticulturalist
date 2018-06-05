const install = require('./install')
const fatality = require('./utils/fatality')

class Deployment {
  constructor(deployDoc, mode) {
    this.doc = deployDoc
    this.action = deployDoc.action
  }

  isNew() {
    return !!this.doc &&
      !this.doc._deleted &&
      this.doc._id === HORTI_UPGRADE_DOC &&
    (this.doc.action !== ACTIONS.STAGE || !this.doc.staging_complete)
  }

  run(firstRun=false) => {
    if (!this.action || this.action === ACTIONS.INSTALL) {
      install.install(this.doc, this.mode, firstRun)
    } else if (this.action === ACTIONS.STAGE) {
      install.stage(this.doc)
    } else if (this.action === ACTIONS.COMPLETE) {
      install.complete(this.doc, mode, firstRun)
    }
  }

  static watch(mode) {
    info('Watching for deployments')
    const watch = api.changes()
    // TODO: consider a more robust solution?
    // If we lose connection and then reconnect we may miss an upgrade doc.
    // Restarting Horti isn't the worst thing in this case
    // Though it does mean that api and sentinel go down, which is bad
    watch.on('error', fatality)
    watch.on('change', change => {
      const deployDoc = change.doc
      if (newDeployment(deployDoc)) {
        info(`Change in ${HORTI_UPGRADE_DOC} detected`)
        watch.cancel()
        // Old builds had no schema_version. New builds should be blocked from
        // accidentally having no schema version by the builds server's
        // validate_doc_update function
        if (!deployDoc.schema_version || deployDoc.schema_version === 1) {
          await performDeployment(deployDoc, mode)
          await watchForDeployments(mode)
          .catch(fatality)
        } else {
          return fatality(new Error('Cannot handle deploy doc schema_version ' + deployDoc.schema_version))
        }
      }

      if (deployDoc._id === LEGACY_0_8_UPGRADE_DOC) {
        info('Legacy <=0.8 upgrade detected, converting…')
        const legacyDeployInfo = deployDoc.deploy_info
        // We will see this write and go through the HORTI_UPGRADE_DOC if block
        await api.remove(deployDoc)
        api.update({
          _id: HORTI_UPGRADE_DOC,
          schema_version: 1,
          user: legacyDeployInfo.user,
          created: legacyDeployInfo.timestamp,
          build_info: {
            namespace: 'medic',
            application: 'medic',
            version: legacyDeployInfo.version
          },
          action: 'install'
        })
      }
    })
}

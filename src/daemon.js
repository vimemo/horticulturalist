const { info } = require('./log');

const {
  LEGACY_0_8_UPGRADE_DOC,
  HORTI_UPGRADE_DOC,
  ACTIONS
} = require('./constants');

const DB = require('./dbs'),
      install = require('./install'),
      fatality = require('./fatality');

const newDeployment = deployDoc =>
  !!deployDoc &&
  !deployDoc._deleted &&
  deployDoc._id === HORTI_UPGRADE_DOC &&
  (deployDoc.action !== ACTIONS.STAGE || !deployDoc.staging_complete);

const performDeployment = (deployDoc, mode, apps, firstRun=false) => {
  let deployAction;

  if (!deployDoc.action || deployDoc.action === ACTIONS.INSTALL) {
    deployAction = install.install(deployDoc, mode, apps, firstRun);
  } else if (deployDoc.action === ACTIONS.STAGE) {
    deployAction = install.stage(deployDoc);
  } else if (deployDoc.action === ACTIONS.COMPLETE) {
    deployAction = install.complete(deployDoc, mode, apps, firstRun);
  }

  return deployAction;
};

const watchForDeployments = (mode, apps) => {
  info('Watching for deployments');

  const watch = api.changes();

  // TODO: consider a more robust solution?
  // If we lose connection and then reconnect we may miss an upgrade doc.
  // Restarting Horti isn't the worst thing in this case
  // Though it does mean that api and sentinel go down, which is bad
  watch.on('error', fatality);

  watch.on('change', change => {
    const deployDoc = change.doc;

    if (module.exports._newDeployment(deployDoc)) {
      info(`Change in ${HORTI_UPGRADE_DOC} detected`);
      watch.cancel();

      // Old builds had no schema_version. New builds should be blocked from
      // accidentally having no schema version by the builds server's
      // validate_doc_update function
      if (!deployDoc.schema_version || deployDoc.schema_version === 1) {
        return module.exports._performDeployment(deployDoc, mode, apps)
          .then(() => module.exports._watchForDeployments(mode, apps))
          .catch(fatality);
      } else {
        return fatality(new Error('Cannot handle deploy doc schema_version ' + deployDoc.schema_version));
      }
    }

    if (deployDoc._id === LEGACY_0_8_UPGRADE_DOC) {
      info('Legacy <=0.8 upgrade detected, converting…');

      const legacyDeployInfo = deployDoc.deploy_info;

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
        });
    }
  });
};

module.exports = {
  init: (deployDoc, mode, apps) => {
    let bootActions = Promise.resolve();

    if (mode.manageAppLifecycle && mode.daemon) {
      bootActions = bootActions.then(() => apps.start());
    }

    if (module.exports._newDeployment(deployDoc)) {
      bootActions = bootActions.then(() => module.exports._performDeployment(deployDoc, mode, apps, true));
    }

    if (mode.daemon) {
      bootActions = bootActions.then(() => module.exports._watchForDeployments(mode, apps));
    }

    return bootActions;
  },
  _newDeployment: newDeployment,
  _performDeployment: performDeployment,
  _watchForDeployments: watchForDeployments
};

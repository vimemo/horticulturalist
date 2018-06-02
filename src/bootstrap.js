const utils = require('./utils');
const { info, debug } = require('./log');

const {
  HORTI_UPGRADE_DOC,
  ACTIONS
} = require('./constants');


const buildInfo = (version) => {
  if (version.startsWith('@')) {
    debug('Version is a channel, finding out the latest version')
    version = version.substring(1)
    const releases = api.releases()
    if (results.rows.length === 0) {
      throw new Error(`There are currently no builds for the '${version}' channel`)
    }
    debug(`Found ${results.rows[0].id}`)
    const [namespace, application, version] = results.rows[0].id.split(':')
    return {
      namespace: namespace,
      application: application,
      version: version
    };
  } else {
    return {
      namespace: 'medic',
      application: 'medic',
      version: version
    };
  }
};

const initDeploy = (action, version) => {
  info(`Doing ${action} to ${version}`);
  return getUpgradeDoc()
    .then(existingDeployDoc => {
      return buildInfo(version)
        .then(buildInfo => {
          debug('Bootstrapping upgrade doc');

          const upgradeDoc = {
              _id: HORTI_UPGRADE_DOC,
              user: 'horticulturalist cli',
              created: new Date().getTime(),
              action: action,
              build_info: buildInfo
          };

          if (existingDeployDoc) {
            upgradeDoc._rev = existingDeployDoc._rev;
          }

          return utils.update(upgradeDoc);
        });
    });
};

const completeDeploy = () => {
  return getUpgradeDoc()
    .then(upgradeDoc => {
      if (!upgradeDoc) {
        throw Error('There is no installation to complete');
      }
      if (!upgradeDoc.staging_complete) {
        throw Error('A deploy exists but it is not ready to complete');
      }

      upgradeDoc.action = ACTIONS.COMPLETE;

      return utils.update(upgradeDoc);
    });
};

module.exports = {
  install: version => initDeploy(ACTIONS.INSTALL, version),
  stage: version => initDeploy(ACTIONS.STAGE, version),
  complete: completeDeploy,
  existing: getUpgradeDoc
};

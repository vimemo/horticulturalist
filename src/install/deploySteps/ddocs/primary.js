const getDeployedDdocId = id => id.replace(':staged:', '')

// primaryDdoc._id
class PrimaryDdoc {
  constructor(primaryDdoc) {
    this.primaryDdoc = primaryDdoc
  }

  deploy() {
    debug(`Primary ddoc: ${primaryDdoc._id}`);
    debug('Checking to see if primary exists already');

    primaryDdoc._id = getDeployedDdocId(primaryDdoc._id);

    try {
      const deployedDdoc = api.get(primaryDdoc._id)
      if (deployedDdoc) {
        debug('It does')
        primaryDdoc.app_settings = deployedDdoc.app_settings
        primaryDdoc._rev = deployedDdoc._rev
      } else {
        debug('It does not')
        delete primaryDdoc._rev
      }
      debug('Writing primary ddoc')
      await api.update(primaryDdoc)
      debug('Primary ddoc written')
    } catch(err) {
      err.status !== 404 && throw err;
    }
  }
}

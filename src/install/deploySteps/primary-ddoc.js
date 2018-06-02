class PrimaryDdoc {
  constructor(id) {
    debug(`Primary ddoc: ${primaryDdoc._id}`);
    debug('Checking to see if primary exists already');

    primaryDdoc._id = utils.getDeployedDdocId(primaryDdoc._id);

    try {
      const deployedDdoc = DB.app.get(primaryDdoc._id)
      if (deployedDdoc) {
        debug('It does')
        primaryDdoc.app_settings = deployedDdoc.app_settings
        primaryDdoc._rev = deployedDdoc._rev
      } else {
        debug('It does not')
        delete primaryDdoc._rev
      }
      debug('Writing primary ddoc')
      await DB.app.put(primaryDdoc)
      debug('Primary ddoc written')
    } catch(err) {
      err.status !== 404 && throw err;
    }
  }
}

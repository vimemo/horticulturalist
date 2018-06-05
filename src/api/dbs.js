const request = require('request-promise-native'),
        {URL} = require('url'),
      PouchDB = require('pouchdb')

const STAGING_URL = 'https://staging.dev.medicmobile.org/_couch/builds';

const COUCH_URL = new URL(process.env.COUCH_URL);
COUCH_URL.pathname = '/';

// TODO: consider how to filter these just to the active database.
// On CouchDB 2.x you only get the shard name, which looks like:
// shards/80000000-ffffffff/medic.1525076838
// On CouchDB 1.x (I think) you just get the exact DB name
const activeTasks = () => {
  return request({url: COUCH_URL + '/_active_tasks', json: true})
}

const DEPLOY_URL = process.env.COUCH_URL;
if(!DEPLOY_URL) throw new Error('COUCH_URL env var not set.');
module.exports = {
  app: new PouchDB(DEPLOY_URL/*, {ajax: {timeout: 60000}}*/),
  builds: new PouchDB(STAGING_URL),
  activeTasks: activeTasks
}

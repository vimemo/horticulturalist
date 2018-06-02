const {
  HORTI_UPGRADE_DOC,
  ACTIONS
} = require('./constants');


const getUpgradeDoc = () => {
  return DB.app.get(HORTI_UPGRADE_DOC)
    .catch(err => {
      if (err.status !== 404) {
        throw err;
      }
    });
};


const releases = () => {
  return DB.builds.query('builds/releases', {
    startkey: [version, 'medic', 'medic', {}],
    endkey: [version, 'medic', 'medic'],
    descending: true,
    limit: 1
  })
}

const changes = () => {
  return DB.app.changes({
    live: true,
    since: 'now',
    doc_ids: [ HORTI_UPGRADE_DOC, LEGACY_0_8_UPGRADE_DOC],
    include_docs: true,
    timeout: false,
  })
}

const remove = (deployDoc) => {
  DB.app.remove(deployDoc)
}

const update = (x) => {
  return DB.app.put(x);
}

const getStagedDdocs

DB.app.allDocs({
                  startkey: '_design/:staged:',
                  endkey: '_design/:staged:\ufff0',
                  include_docs: includeDocs,
                  attachments: attachments,
                  binary: attachments})

const DB = require('./dbs');

module.exports = {
  mainDdocId: deployDdoc => `_design/${deployDdoc.build_info.application}`,
  getDeployedDdocId: id => id.replace(':staged:', ''),
  stageDdoc: doc => {
    doc._id = module.exports.getStagedDdocId(doc._id);
    delete doc._rev;

    return doc;
  },
  appendDeployLog: (deployDoc, message, type='stage') => {
    if (!deployDoc.log) {
      deployDoc.log = [];
    }

    deployDoc.log.push({
      type: type,
      datetime: new Date().getTime(),
      message: message
    });

    return module.exports.update(deployDoc);
  },
  update: doc => {
    return DB.app.put(doc).then(({rev}) => {
      doc._rev = rev;
      return doc;
    });
  },
  strictBulkDocs: docs => {
    return DB.app.bulkDocs(docs)
      .then(result => {
        const errors = result.filter(r => r.error);

        if (errors.length) {
          const error = Error('bulkDocs did not complete successfully');
          error.errors = errors;
          throw error;
        }

        return result;
      });
  }
};

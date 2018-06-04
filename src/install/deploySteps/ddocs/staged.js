class StagedDdocs {

  constructor(includeDocs, attachments, deployDdoc) {
    this.docs = api.getStagedDdocs(includeDocs, attachments)
    const mainDdocId = `_design/${deployDdoc.build_info.application}`
    this.stagedMainDdocId = mainDdocId.replace('_design/', '_design/:staged:')
  }

  load() {
    return this.docs.reduce((acc, ddoc) => {
      if (ddoc._id === this.stagedMainDdocId) {
        acc.primaryDdoc = ddoc
      } else {
        acc.secondaryDdocs.push(ddoc)
      }
      return acc;
    }, {secondaryDdocs: []})
  }

  deploy() {
    info(`Deploying staged ddocs`)
    const {primaryDdoc, secondaryDdocs} = this.load()
    await secondaryDdocs.deploy()
    await primaryDdoc.deploy()
  }

  clear() {
    debug('Clear existing staged DBs')
    //TODO vimago - new StagedDocs().clear() ????
    const docs = await utils.getStagedDdocs()
    if (docs.length) {
      docs.forEach(d => d._deleted = true);

      debug(`Deleting staged ddocs: ${JSON.stringify(docs.map(d => d._id))}`)
      return utils.strictBulkDocs(docs);
    }
  }

}

class StagedDdocs {

  constructor(includeDocs, attachments, deployDoc) {
    const {rows} = api.getStagedDdocs(includeDocs, attachments)
    this.docs = includeDocs
          ? rows.map(r => r.doc)
          : rows.map(r => ({_id: r.id, _rev: r.value.rev}))
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
    }, {secondaryDdocs: []});
  }

  deploy() {
    info(`Deploying staged ddocs`);
    const {primaryDdoc, secondaryDdocs} = this.load()
    await secondaryDdocs.deploy()
    await primaryDdoc.deploy()
  };
}

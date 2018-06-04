const stageDdoc = doc => {
  doc._id = getStagedDdocId(doc._id)
  delete doc._rev
  return doc;
}

class DeployDoc {
  constructor(doc) {
    this.doc = doc
  }

  stage() {
    stageLog(this.doc.message)
    return utils.appendDeployLog(this.doc, {key: this.doc.key, message: this.doc.message})
  }

  key() {
    return [
      this.doc.build_info.namespace,
      this.doc.build_info.application,
      this.doc.build_info.version
    ].join(':')
  }

  remove() {
    debug('Delete deploy ddoc')
    this.doc._deleted = true
    await this.update(this.doc)
  }

  appendDeployLog(message, type='stage') {
    if (!this.doc.log) {
      this.doc.log = []
    }
    this.doc.log.push({
      type: type,
      datetime: new Date().getTime(),
      message: message
    })
    return this.update(this.doc)
  }

  // debug(`Downloading ${keyFromthis.doc(this.doc)}, this may take some time…`)
  // debug(`Got ${deployable._id}, staging`)
  // debug(`Staged as ${deployable._id}`)
  downloadBuild() {
    const deployable = await api.getBuildsDoc(key())
    deployable._id = `_design/${this.doc.build_info.application}`
    stageDdoc(deployable)
    deployable.deploy_info = {
      timestamp: new Date(),
      user: this.doc.user,
      version: this.doc.build_info.version,
    }
    delete deployable._rev;
    await utils.update(deployable)
    return deployable
  }

  warmViews() {
    const writeProgress = () => {
      const tasks = await DB.activeTasks()
      // TODO: make the write-over better here:
      // Order these sensibly so the UI doesn't have to
      // If it's new add it
      // If it was already there update it
      // If it's gone make its progress 100%
      const relevantTasks = tasks.filter(task =>
        task.type === 'indexer' && task.design_document.includes(':staged:'))
      const entry = deployDoc.log[deployDoc.log.length - 1];
      entry.indexers = relevantTasks;
      return utils.update(deployDoc);
      process.stdout.write('.')
    }
    const probeViews = viewlist => {
      try {
        await Promise.all(viewlist.map(view => api.getOne(view).concat(writeProgress()))
        info('Warming views complete')
      } catch(err) {
        err.code !== 'ESOCKETTIMEDOUT' && throw err
        return probeViews(viewlist)
      }
    }
    const firstView = ddoc =>
      `${ddoc._id.replace('_design/', '')}/${Object.keys(ddoc.views).find(k => k !== 'lib')}`;
    const ddocs = await utils.getStagedDdocs(true)
    const queries = ddocs
      .filter(ddoc => ddoc.views && Object.keys(ddoc.views).length)
      .map(firstView);
    deployDoc.log.push({type: 'warm_log'})
    await utils.update(deployDoc)
    probeViews(queries)
  }
}
// debug(`Got ${ddocs.length} staged ddocs`);
// info('Beginning view warming')

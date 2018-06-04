const {
  HORTI_UPGRADE_DOC,
  ACTIONS
} = require('./constants');

class Api {
  constructor() {
    this.db = DB.app
    this.builds = DB.builds
  }
  // keyFromthis.doc(this.doc)
  getBuildsDoc(key) {
    return this.builds.get(key, { attachments: true, binary: true })
  }
  getOneFromView(view) { return this.db.query(view, {limit: 1}) }
  getOne(id) { return this.db.get(id) }
  update(x) { return this.db.put(x) }
  remove(deployDoc) { return this.db.remove(deployDoc) }
  bulkDocs(docs) { return this.db.bulkDocs(docs) }
  getAll(ids) { return (await this.db.allDocs({keys: deployIds})).rows }

  async getUpgradeDoc() {
    try {
      return await this.getOne(HORTI_UPGRADE_DOC)
    } catch(err) {
      err.status !== 404 && throw err
    }
  }

  async getStagedDdocs(includeDocs, attachments) {
    const {rows} = await this.db.allDocs({
      startkey: '_design/:staged:',
      endkey: '_design/:staged:\ufff0',
      include_docs: includeDocs,
      attachments: attachments,
      binary: attachments})
    return includeDocs
      ? rows.map(r => r.doc)
      : rows.map(r => ({_id: r.id, _rev: r.value.rev}))
  }

  async release(version) {
    const releases = await this.db.query('builds/releases', {
      startkey: [version, 'medic', 'medic', {}],
      endkey: [version, 'medic', 'medic'],
      descending: true,
      limit: 1
    })
    if (releases.length === 0) {
      throw new Error(`There are currently no builds for the '${version}' channel`)
    }
    debug(`Found ${releases[0].id}`)
    return releases[0].id.split(':')
    // const [namespace, application, version] = api.release()
    // return {
    //   namespace: namespace,
    //   application: application,
    //   version: version
    // }
  }

  const buildInfo = version => {
    if (version.startsWith('@')) { // debug('Version is a channel, finding out the latest version')
      return api.release(version.substring(1))
    }
    return {namespace: 'medic', application: 'medic', version: version}
  }

  async changes() {
    return await this.db.changes({
      live: true,
      since: 'now',
      doc_ids: [ HORTI_UPGRADE_DOC, LEGACY_0_8_UPGRADE_DOC],
      include_docs: true,
      timeout: false,
    })
  }

  async cleanUp() {
    // Free as much space as possible, warming views is expensive as it
    // doubles the amount of space used by views
    debug('Starting compact and view cleanup')
    return await Promise.all([this.db.compact(), this.db.viewCleanup()])
  }

  getAttachments(id) {
    return this.db.get(id, {attachments: true, binary: true})
  }

  bulkDocs(docs) {
    const result = await this.db.bulkDocs(docs)
    const errors = result.filter(r => r.error)
    if (errors.length) {
      const error = Error('bulkDocs did not complete successfully')
      error.errors = errors
      throw error
    }
    return result
  }

  utilsUpdate(doc) {
    const {rev} = await this.update(doc)
    doc._rev = rev
    return doc
  }

  deployDoc(action) {
    let doc = await getUpgradeDoc()
    if(action === Action.COMPLETE) {
      !doc && throw Error('There is no installation to complete')
      !doc.staging_complete && throw Error('A deploy exists but it is not ready to complete')
      doc.action = ACTIONS.COMPLETE
      api.update(doc)
    } else if(_.contains([Action.INSTALL, Action.STATE], action)) {
      doc = {
        _id: HORTI_UPGRADE_DOC,
        user: 'horticulturalist cli',
        created: new Date().getTime(),
        action: action,
        build_info: await api.buildInfo(version),
        _rev: doc && doc._rev
      }
      api.update(doc)
    }
    return doc
  }
}

const {
  HORTI_UPGRADE_DOC,
  ACTIONS
} = require('./constants');
const dbs = requre('./dbs');

class Api {
  constructor() {
    this.db = dbs.app
    this.builds = dbs.builds
  }

  get(id) { return this.db.get(id) }
  getFromView(view) { return this.db.query(view, {limit: 1}) }
  remove(deployDoc) { return this.db.remove(deployDoc) }
  bulkDocs(docs) { return this.db.bulkDocs(docs) }
  getAll(ids) { return (await this.db.allDocs({keys: deployIds})).rows }

  update(doc) {
    const {rev} = await this.db.put(doc)
    doc._rev = rev
    return doc
  }

  async release(ver) {
    const releases = await this.db.query('builds/releases', {
      startkey: [ver, 'medic', 'medic', {}],
      endkey: [ver, 'medic', 'medic'],
      descending: true,
      limit: 1
    })
    if (releases.length === 0) {
      throw new Error(`There are currently no builds for the '${ver}' channel`)
    }
    debug(`Found ${releases[0].id}`)
    const [namespace, application, version] = releases[0].id.split(':')
    return {namespace, application, version}
  }

  buildInfo(ver) {
    if (ver.startsWith('@')) { // debug('Version is a channel, finding out the latest version')
      return this.release(ver.substring(1))
    }
    return {namespace: 'medic', application: 'medic', version: ver}
  }

  async upgradeDoc() {
    try {
      return await this.db.get(HORTI_UPGRADE_DOC)
    } catch(err) {
      err.status !== 404 && throw err
      return null
    }
  }

  async deployDoc(action) {
    let doc = await this.upgradeDoc()
    if(action === ACTIONS.COMPLETE) {
      !doc && throw Error('There is no installation to complete')
      !doc.staging_complete && throw Error('A deploy exists but it is not ready to complete')
      doc.action = ACTIONS.COMPLETE
      this.update(doc)
    } else if([ACTIONS.INSTALL, ACTIONS.STATE].includes(action)) {
      doc = {
        _id: HORTI_UPGRADE_DOC,
        user: 'horticulturalist cli',
        created: new Date().getTime(),
        action: action,
        build_info: await this.buildInfo(version),
        _rev: doc && doc._rev
      }
      this.update(doc)
    }
    return doc
  }

  async stagedDdocs(includeDocs, attachments) {
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

  async changes(since='now') {
    return await this.db.changes({
      live: true,
      since: since,
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

  attachments(id) {
    return this.db.get(id, {attachments: true, binary: true})
  }

  getBuildsDoc(id) {
    return this.builds.get(id, { attachments: true, binary: true })
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
}

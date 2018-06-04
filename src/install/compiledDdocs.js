const stageDdoc = doc => {
  doc._id = getStagedDdocId(doc._id)
  delete doc._rev
  return doc;
}

//
// TODO: work out how this should really work
//
// DB.app.bulkDocs calls can time out. The {ajax: {timeout: blah}} setting when
// creating a PouchDB reference does not appear to affect this.
//
// It's not clear if getting a ESOCKETTIMEOUT will *always* result in eventual
// successful writes, or just sometimes. In local testing it has been always,
// but that's not definite.
//
// If it's always, we could re-write this as a promise loop that blocks by
// checking allDocs every few seconds to see if all staged ddocs are present in
// the DB before continuing.
//
// If it's sometimes, this code is mostly correct. However, only because at this
// stage we know that preDeployCleanup has been called, and so any staged ddocs
// present in the system should be from this deploy. If we wish to be more sure
// we might need to make sure the ones in CouchDB are the ones in memory, by
// checking hashes or just forcing a write from us.
//

class CompiledDocs {
  constructor(docs) {
    this.docs = docs
  }

  writeDdocsInSeries(){
    const existingDdoc = docs.reduce((promise, ddoc) => {
      try {
        debug(`Updating ${ddoc._id}`))
        await api.get(ddoc._id))
      } catch(err) {
        err.status !== 404 && throw err
      }
    })
    if (!existingDdoc) {
      debug(`${ddoc._id} doesn't exist (yet), writing`)
      delete ddoc._rev
      try {
        await api.update(ddoc)
      } catch(err) {
        // Already exists, the bulkDocs must have written it in the time
        // between our get and our put
        err.status !== 409 && throw err;
      }
    }
  }

  extractDdocs(ddoc) {
    const compiledDocs = JSON.parse(ddoc._attachments['ddocs/compiled.json'].data).docs
    compiledDocs.forEach(stageDdoc)
    // Also stage the main doc!
    compiledDocs.push(ddoc)
    debug(`Storing staged: ${JSON.stringify(compiledDocs.map(d => d._id))}`)
    try {
      await utils.strictBulkDocs(compiledDocs)
    } catch(err => {
      if (err.code === 'EPIPE') {
        err.horticulturalist = `Failed to store staged ddocs, you may need to increase CouchDB's max_http_request_size`
      }
      if (err.code === 'ESOCKETTIMEDOUT') {
        // Too many ddocs? Let's try them one by one
        debug('Bulk storing timed out, attempting to write each ddoc one by one')
        return writeDdocsInSeries(compiledDocs)
      }
      throw err
    }
  }
}

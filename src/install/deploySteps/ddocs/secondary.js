const deployedDdocId = id => id.replace(':staged:', '')
const deployIds = secondaryDdocs.map(ddoc => ddoc._id).map(id => deployedDdocId(id))

class SecondaryDdocs {
  constructor(docs) {
    this.docs = docs
  }

  deploy() {
    debug(`Secondary ddocs: ${this.docs.map(d => d._id)}`)
    debug('Getting currently deployed secondary ddocs')

    const deployedStubs = await api.getAll(deployIds)
    debug(`Found ${deployedStubs.length}`)

    this.docs.forEach(ddoc => {
      ddoc._id = deployedDdocId(ddoc._id)

      const currentlyDeployed = deployedStubs.find(d => d.id === ddoc._id)
      if (currentlyDeployed) {
        debug(`${ddoc._id} already exists, overwriting`)
        ddoc._rev = currentlyDeployed.value.rev
      } else {
        debug(`${ddoc._id} is new, adding`)
        delete ddoc._rev
      }
    })

    debug('Writing secondary ddocs')
    const results = await utils.strictBulkDocs(this.docs)
    debug(`Secondary ddocs written: ${JSON.stringify(results)}`)
  }
}

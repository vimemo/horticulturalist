const deployedDdocId = id => id.replace(':staged:', '')

const deploySecondaryDdocs = docs => {
  debug(`Secondary ddocs: ${docs.map(d => d._id)}`)
  debug('Getting currently deployed secondary ddocs')

  const deployIds = secondaryDdocs
                        .map(ddoc => ddoc._id)
                        .map(id => deployedDdocId(id))
  const deployedStubs = (await DB.app.allDocs({keys: deployIds})).rows
  debug(`Found ${deployedStubs.length}`)

  docs.forEach(ddoc => {
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

  debug('Writing secondary ddocs');
  const results = await utils.strictBulkDocs(docs)
  debug(`Secondary ddocs written: ${JSON.stringify(results)}`)
}

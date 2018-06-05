const preCleanup = () => {
  await new StagedDdocs().clear()
  await api.cleanUp()
}

const postCleanup = deployDoc => {
  await new StagedDdocs().clear()
  await deployDoc.remove()
  return api.viewCleanup() // debug('Cleanup old views')
}

const predeploySteps = deployDoc => {
  await preCleanup()
  const ddoc = await deployDoc.downloadBuild()
  await extractDdocs(ddoc)
  await deployDoc.warmViews()
  return ddoc
}

const deploySteps = (mode, deployDoc, firstRun, ddoc) => {
  await performDeploy(mode, deployDoc, ddoc, firstRun)
  // const deploy = require('./deploySteps')(mode, deployDoc)
  // return deploy.run(ddoc, firstRun)
  await postCleanup(deployDoc)
}

module.exports = {
  install: (deployDoc, mode, firstRun) => {
    const ddoc = await predeploySteps(deployDoc)
    await deploySteps(mode, deployDoc, firstRun, ddoc)
  },
  stage: deployDoc => {
    await predeploySteps(deployDoc)
    deployDoc.staging_complete = true
    return utils.update(deployDoc)
  },
  complete: (deployDoc, mode, firstRun) => {
    return deploySteps(mode, deployDoc, firstRun)
  }
}

// TODO: when all is said and done
//       do we still need apps, and first run?
//       (cause you can intuit them?)
//  (
//    you know what apps exist because they are in the application ddoc list
//    you know if its first run because the apps are either running or they're not
//  )

// info(`Deploying new build: ${keyFromDeployDoc(deployDoc)}`);
// info(`Staging new build: ${keyFromDeployDoc(deployDoc)}`);\
// info(`Deploying staged build: ${keyFromDeployDoc(deployDoc)}`);


// const stage = deployDoc.stage()
// await stage('horti.stage.init', `Horticulturalist deployment of '${deployDoc.key}' initialising`)
// await stage('horti.stage.preCleanup', 'Pre-deploy cleanup')
// await stage('horti.stage.download', 'Downloading and staging install')
// await stage('horti.stage.extractingDdocs', 'Extracting ddocs')
// await stage('horti.stage.warmingViews', 'Warming views')
// await stage('horti.stage.readyToDeploy', 'View warming complete, ready to deploy')

// const stage = deployDoc.stage()
// const x = await stage('horti.stage.initDeploy', 'Initiating deployment')
// await stage('horti.stage.deploying', 'Deploying new installation')
// await stage('horti.stage.postCleanup', 'Post-deploy cleanup, installation complete')
// const ddoc = getApplicationDdoc(x)

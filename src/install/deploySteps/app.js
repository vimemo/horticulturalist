class App {
  constructor(ddoc, module, mode) {
    if (!ddoc._attachments[module]) {
      throw Error(`${module} was specified in build_info.node_modules but is not attached`);
    }

    this.name = module.substring(0, module.lastIndexOf('-'))
    this.attachmentName = module
    this.digest = ddoc._attachments[module].digest
    this.path = this.deployPath()
    this.unzipped = fs.existsSync(this.path);
  }

  deployPath(identifier) {
    identifier = identifier || this.digest.replace(/\//g, '')
    return path.resolve(path.join(this.mode.deployments, this.name, identifier))
  }
}

const  help = require('help').
  parseArgs = require('minimist'),
      MODES = require('./modes'),
{ ACTIONS } = require('./constants'),
       help = require('./help'),
  { error } = require('./log')

const active = (...things) => things.filter(t => !!t)

const action = argv => {
  return  argv.install             ? ACTIONS.INSTALL :
          argv.stage               ? ACTIONS.STAGE :
          argv['complete-install'] ? ACTIONS.COMPLETE :
          undefined
}

const modex = argv => {
  const mode = argv.dev         ? MODES.development :
               argv.local       ? MODES.local :
               argv['medic-os'] ? MODES.medic_os :
               undefined;
  if(mode) {
    mode.daemon = argv.daemon
  }
  return mode
}

class Config {
  constructor(process) {
    const argv = parseArgs(process.argv, {default: {daemon: true}})
    if (argv.version || argv.v) {
      help.outputVersion()
    } if (active(argv.dev, argv.local, argv['medic-os']).length !== 1) {
      help.outputHelp()
      error('You must pick one mode to run in.')
    } else if (active(argv.install, argv.stage, argv['complete-install']).length > 1) {
      help.outputHelp()
      error('Pick only one action to perform')
    } else {
      const mode = modex(argv)
      if (!mode || argv.help || argv.h) {
        help.outputHelp()
      } else {
        if (!mode.daemon && !action(argv)) {
          help.outputHelp()
          error('--no-daemon does not do anything without also specifiying an action')
        } else {
          this.mode = mode
          this.version = (argv.install || argv.stage) && 'master'
        }
      }
    }

    !this.mode && process.exit(0)
    process.on('uncaughtException', err => {
      error('********FATAL********')
      error(err)
      process.exit(1)
    })
  }
}

const argv = parseArgs(process.argv, {
  default: {
    daemon: true
  }
})

if (active(argv.dev, argv.local, argv['medic-os']).length !== 1) {
  help.outputHelp();
  error('You must pick one mode to run in.');
  return;
}

const MODES = {
  development: {
    name: 'development',
    deployments: './temp/deployments',
    start: [ 'bin/svc-start', './temp/deployments', '{{app}}' ],
    stop: [ 'bin/svc-stop', '{{app}}' ],
    manageAppLifecycle: true,
  },
  local: {
    name: 'local',
    deployments: `${os.homedir()}/.horticulturalist/deployments`,
    start: [ 'horti-svc-start', `${os.homedir()}/.horticulturalist/deployments`, '{{app}}' ],
    stop: [ 'horti-svc-stop', '{{app}}' ],
    manageAppLifecycle: true,
  },
  medic_os: {
    name: 'Medic OS',
    deployments: '/srv/software',
    start: ['sudo', '-n', '/boot/svc-start', '{{app}}' ],
    stop: ['sudo', '-n', '/boot/svc-stop', '{{app}}' ],
    // MedicOS will start and stop apps, though we will still restart them
    // when upgrading
    manageAppLifecycle: false,
  },
}

if (argv.version || argv.v) {
  help.outputVersion()
  return
}

if (!mode || argv.help || argv.h) {
  help.outputHelp()
  return
}

if (active(argv.install, argv.stage, argv['complete-install']).length > 1) {
  help.outputHelp()
  error('Pick only one action to perform')
  return
}

const active = (...things) => things.filter(t => !!t)

const action = argv.install             ? ACTIONS.INSTALL :
               argv.stage               ? ACTIONS.STAGE :
               argv['complete-install'] ? ACTIONS.COMPLETE :
               undefined

let version = argv.install || argv.stage
if (version === true) {
  version = 'master'
}

const mode = argv.dev         ? MODES.development :
             argv.local       ? MODES.local :
             argv['medic-os'] ? MODES.medic_os :
             undefined;

mode.daemon = argv.daemon

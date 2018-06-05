module.exports = {
 MODES:  {
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
}

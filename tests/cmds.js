class Lockfile {
  static exists() {
    return false
  }

  whatevs() {
    return true
  }
}

describe('static methods', () => {
  test('simon', () => {
    console.log(Lockfile.exists())
    // console.log(Lockfile.whatevs())
  })
})

// const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))
//
// const apps = ['a','b','c']
//
// const simon = async () => {
//   return Promise.all(apps.map(async (app) => {
//     console.log(`starting with ${app}`)
//     await sleep(1000)
//     console.log(`finishing with ${app}`)
//   }))
// }

// describe('cmds', () => {
//   it('start cmd', async (done) => {
//     console.log(await simon())
//     console.log('done')
//     await sleep(200)
//     // console.log(simon())
//     done()
//   })
// })

// describe('version', () => {
//   it('checks', () => {
//     let version = (0 || false) && 'master'
//     // if (version === true) {
//       // version = 'master'
//     // }
//     console.log(version)
//   })
// })

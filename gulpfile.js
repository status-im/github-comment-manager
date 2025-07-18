import { src, series } from 'gulp'
import mocha from 'gulp-mocha'
import print from 'gulp-print'
import { promisify } from 'util'
import { spawn } from 'child_process'
import nodemon from 'gulp-nodemon'
import pkg from './package.json' with { type: 'json' }

export function spawnAsync(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',  // stream output live
      shell: true,       // needed for shell features like globs, pipes
      ...options
    });

    child.on('error', reject); // error starting the process

    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} exited with code ${code}`));
      }
    });
  });
}

const IMAGE_TAG = `v${pkg.version}`

export function devel() {
  nodemon({
      script: 'src/index.js',
      presets: ['env', 'stage-2'],
    })
    .on('restart', () => { console.log('>> node restart') })
}

export async function test() {
  src('test/**/*.js', {read: false})
    .pipe(mocha({sort: true, reporter: 'list'}))
}

export function test_watch() {
  src('test/**/*.js', {read: false})
    .pipe(mocha({sort: true, reporter: 'list', watch: true}))
}

export async function build() {
  await spawnAsync('docker', [`build -t harbor.status.im/status-im/ghcmgr:${IMAGE_TAG} .`])
}

export async function push() {
  await spawnAsync('docker', [`push harbor.status.im/status-im/ghcmgr:${IMAGE_TAG}`])
}

export async function release() {
  await series(test, build, push)()
}

export default {
  test
}

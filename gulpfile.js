const gulp = require('gulp')
const mocha = require('gulp-mocha')
const print = require('gulp-print').default
const run = require('gulp-run-command').default
const nodemon = require('gulp-nodemon')
const { version } = require('./package.json')

const IMAGE_TAG = `v${version}`

exports.devel = () =>
  nodemon({
      script: 'src/server.js',
      presets: ['env', 'stage-2'],
    })
    .on('restart', () => { console.log('>> node restart') })

exports.test = () =>
  gulp.src('test/**/*.js', {read: false})
    .pipe(mocha({sort: true, reporter: 'list'}))

exports.test_watch = () =>
  gulp.src('test/**/*.js', {read: false})
    .pipe(mocha({sort: true, reporter: 'list', watch: true}))

exports.image_build = run(`docker build -t harbor.status.im/status-im/ghcmgr:${IMAGE_TAG} .`)
exports.image_push = run(`docker push harbor.status.im/status-im/ghcmgr:${IMAGE_TAG}`)
exports.image = exports.image_build
exports.push = exports.image
exports.default = exports.test
exports.docker = gulp.series(exports.test, exports.image_build, exports.image_push)
exports.release = exports.docker
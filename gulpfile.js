const gulp = require('gulp')
const clean = require('gulp-clean')
const mocha = require('gulp-mocha')
const print = require('gulp-print').default
const run = require('gulp-run-command').default
const nodemon = require('gulp-nodemon')

gulp.task('devel', () => {
  nodemon({
      script: 'src/server.js',
      presets: ['env', 'stage-2'],
    })
    .on('restart', () => { console.log('>> node restart') })
})

gulp.task('clean', () =>
  gulp.src('dist/*').pipe(clean())
)

gulp.task('test', () =>
  gulp.src('test/**/*.js', {read: false})
    .pipe(mocha({reporter: 'list'}))
)

gulp.task('testw', () =>
  gulp.src('test/**/*.js', {read: false})
    .pipe(mocha({reporter: 'list', watch: true}))
)

gulp.task('build', ['clean', 'test'], () =>
  gulp.src('src/**/*.js')
    .pipe(print())
    .pipe(gulp.dest('dist/'))
)

gulp.task('image', ['build'], run('docker build -t statusteam/ghcmgr .'))

gulp.task('push', ['image'], run('docker push statusteam/ghcmgr'))

gulp.task('default', ['build'])
gulp.task('release', ['push'])

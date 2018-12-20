const gulp = require('gulp')
const babel = require('gulp-babel')
const clean = require('gulp-clean')
const mocha = require('gulp-mocha')
const print = require('gulp-print').default
const nodemon = require('gulp-nodemon')

gulp.task('devel', () => {
  nodemon({
      script: 'src/server.js',
      presets: ['env', 'stage-2'],
      exec: 'babel-node'
    })
    .on('restart', () => { console.log('>> node restart') })
})

gulp.task('clean', () =>
  gulp.src('dist/*').pipe(clean())
)

gulp.task('test', () =>
  gulp.src('test/**/*.js', {read: false})
    .pipe(mocha({reporter: 'list', compilers: '@babel/register'}))
)

gulp.task('build', () =>
  gulp.src('src/**/*.js')
    .pipe(babel())
    .pipe(print())
    .pipe(gulp.dest('dist/'))
)

gulp.task('default', ['clean', 'test', 'build'])

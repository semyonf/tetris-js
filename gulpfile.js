const gulp = require('gulp');
const path = require('path');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const clean = require('gulp-clean');
const headerComment = require('gulp-header-comment');

gulp.task('default', () => {
  gulp.src('dist/tetris.js')
    .pipe(headerComment({
      file: path.join(__dirname, 'LICENSE')
    }))
    // .pipe(header(copyright))
    .pipe(gulp.dest('dist'))

    .pipe(babel({
      presets: ['env']
    }))
    .pipe(rename('tetris.es5.js'))
    .pipe(gulp.dest('dist'))

    .pipe(uglify())
    .pipe(rename('tetris.es5.min.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', function () {
  return gulp.src('dist/*', { read: false })
    .pipe(clean());
});
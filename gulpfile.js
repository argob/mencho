var gulp = require('gulp');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var uglifyes = require('gulp-uglifyes');
var sass = require('gulp-sass')(require('sass'));
var plumber = require('gulp-plumber');
var concat = require('gulp-concat');
var babel = require('gulp-babel');
var SRC = './src/js/*.js';
var DEST = './dist/js/*.js';
var rename = require('gulp-rename');
const gulpIF = require('gulp-if');
var replace = require('gulp-replace');


gulp.task('poncho', function(){
  return gulp.src([
          './src/js/utils.js',
          './src/js/poncho-table.js',
          './src/js/poncho-popover.js',
          './src/js/poncho-ubicacion.js',
          './src/js/poncho-charts.js',
          './src/js/poncho-gapi-legacy.js',
          './src/js/poncho-map.js',
          './src/js/poncho-map-filter.js',
          './src/js/poncho-map-search.js',
          './src/js/gapi-sheet-data.js'
      ])
      .pipe(replace(/\/\/\s?\$START_TEST\$([\s\S]*?)\/\/\s?\$END_TEST\$/gm, '/* module.exports REMOVED */'))
      .pipe(concat('poncho.js', {'newLine':'\n\n'}))
      // .pipe(babel())
      .pipe(gulp.dest('dist/js/'));
});

gulp.task('sass', function(){
  return gulp.src([
        './src/scss/*.scss'
    ])
    // .pipe(sass())
    .pipe(sass.sync({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(gulpIF(function(file){return file.path.match('poncho.css')}, rename('poncho.min.css')))
    .pipe(gulp.dest('./dist/css'))
});


gulp.task('sass_poncho', function(){
  return gulp.src([
        './src/scss/poncho.scss'
    ])
    .pipe(sass())
    .pipe(gulp.dest('./dist/css'))
});



gulp.task('ponchomin', function(){
  return gulp.src([
        './src/js/utils.js',
        './src/js/poncho-table.js',
        './src/js/poncho-popover.js',
        './src/js/poncho-ubicacion.js',
        './src/js/poncho-charts.js',
        './src/js/poncho-gapi-legacy.js',
        './src/js/poncho-map.js',
        './src/js/poncho-map-filter.js',
        './src/js/poncho-map-search.js',
        './src/js/gapi-sheet-data.js'
      ])
      .pipe(replace(/\/\/\s?\$START_TEST\$([\s\S]*?)\/\/\s?\$END_TEST\$/gm, '/* module.exports REMOVED */'))
      .pipe(concat('poncho.min.js'))
      .pipe(uglify({
          compress: {
              global_defs: {
                  "DEBUG": false
              }
          }
      }))
      .pipe(gulp.dest('dist/js/'));
});


gulp.task('jshint', function(){
  return gulp.src([SRC], {"allowEmpty": true})
      .pipe(plumber())
      .pipe(jshint())
      .pipe(jshint.reporter('default'));
});


gulp.task('compress', function () {
  return gulp.src([
          './src/js/showdown-extensions.js',
          './src/js/mapa-argentina.js'
      ])
      .pipe(babel())
      .pipe(uglify())
      .pipe(gulp.dest('./dist/js/'));
});


gulp.task('default', gulp.series( 'sass', 'sass_poncho', 'compress', 'poncho', 'ponchomin'))
var gulp = require('gulp');
var less = require('gulp-less');
var minifyCss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var watch = require('gulp-watch');
var build = require('gulp-build');
var concat = require('gulp-concat');
var del = require('del');
var rename = require('gulp-rename');

var BASE_DIR = './';

var icons = [ BASE_DIR + 'src/icons/*.png' ];
var favicon = [ BASE_DIR +'src/icons/favicon/*.png' ];
var filesToCopy = [ './src/index.html', 'manifest.json', './src/js/updateIcon.js'];

gulp.task('scripts', function(){
   gulp.src(BASE_DIR + 'src/js/*.js')
     .pipe(concat('app.js'))
     .pipe(uglify().on('error', function (e) {
       console.log(e.message);
     }))
     .pipe(gulp.dest(BASE_DIR + 'dist/'));

});

gulp.task('styles', function(){
   gulp.src(BASE_DIR + 'src/styles/*.less')
     .pipe(concat('app.css'))
     .pipe(less().on('error', function(e){
       console.log(e.message);
     }))
     .pipe(minifyCss())
     .pipe(gulp.dest(BASE_DIR + 'dist/'));

});

gulp.task('copy: icons', function () {
  gulp.src(icons)
    .pipe(rename({dirname: 'icons'}))
    .pipe(gulp.dest(BASE_DIR + 'dist/'))
});

gulp.task('copy: favicon', function () {
  gulp.src(favicon)
    .pipe(rename({dirname: 'icons/favicon'}))
    .pipe(gulp.dest(BASE_DIR + 'dist/'))
});

gulp.task('copy: backgroundScript', function () {
  gulp.src(filesToCopy)
    .pipe(rename({dirname: ''}))
    .pipe(gulp.dest(BASE_DIR + 'dist/'));
});

gulp.task('clean', function () {
  return del(['dist']);
});

gulp.task('copy', ['copy: icons', 'copy: favicon', 'copy: backgroundScript']);

gulp.task('build', ['copy', 'scripts', 'styles']);

gulp.task('default', ['scripts', 'styles'],function(){

    console.log('Watching JS!');
    gulp.watch(BASE_DIR + 'src/**/*.js', ['scripts']);

    console.log('Watching LESS!');
    gulp.watch(BASE_DIR + 'src/**/*.less', ['styles']);

});

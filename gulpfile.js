const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const uglify = require('gulp-uglify');

gulp.task('message',function(){
    return console.log("Gulp is running");
});

gulp.task('default',function(){
    return console.log("Gulp is running");
});

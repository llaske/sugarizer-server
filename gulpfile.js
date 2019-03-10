var gulp = require('gulp'),
var imagemin = require('gulp-imagemin'),
var uglify = require('gulp-uglify');

gulp.task('message',function(){
    return console.log("Gulp is running");
});

gulp.task('default',function(){
    return console.log("Gulp is running");
});

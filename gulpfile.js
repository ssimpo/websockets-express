'use strict';

const settings = loadSettings();
const gulp = require('gulp');
const gutil = require('gulp-util');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const embedTemplates = require('gulp-angular-embed-templates');
const babel = require('gulp-babel');
const rename = require('gulp-rename');

function loadSettings() {
	let packageData = require('./package.json');
	let localData;
	try {
		localData = require('./local.json');
	} catch (err) {
		localData = {};
	}
	return Object.assign({}, packageData.gulp || {}, localData);
}

console.log(settings.dest.js);

gulp.task('minify', ()=>gulp.src(settings.source.js)
	//.pipe(debug())
	.pipe(sourcemaps.init({loadMaps: true}))
	.pipe(embedTemplates())
	.pipe(concat(settings.name + '.js'))
	.pipe(sourcemaps.write('./'))
	.pipe(gulp.dest(settings.dest.js))
	.on('end', ()=>gulp.src(settings.source.js)
		//.pipe(debug())
		.pipe(sourcemaps.init({loadMaps: true}))
		.pipe(embedTemplates())
		.pipe(concat(settings.name + '.min.js'))
		.pipe(babel())
		.pipe(uglify().on('error', gutil.log))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(settings.dest.js))
	)
);

gulp.task('watch', ()=>{
	gulp.watch([].concat(settings.source.js, settings.source.jsTemplates, settings.source.jsScss), ['minify']);
});

gulp.task('build', ['minify']);
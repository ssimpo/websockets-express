'use strict';

const settings = loadSettings();
const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const rename = require('gulp-rename');
const ignore = require('gulp-ignore');

function loadSettings() {
	let packageData = require('./package.json');
	let localData;
	try {
		localData = require('./local.json');
	} catch (err) {
		localData = {};
	}

	return Object.assign(
		{},
		packageData.gulp || {},
		{name: (packageData || {}).name.split('/').pop()},
		localData
	);
}

gulp.task('minify', ()=>gulp.src(settings.source.js)
	.pipe(sourcemaps.init({loadMaps: true}))
	.pipe(concat(settings.name + '.js'))
	.pipe(babel(settings.babel))
	.pipe(sourcemaps.write('./'))
	.pipe(gulp.dest(settings.dest.js))
	.pipe(ignore.exclude('*.map'))
	.pipe(uglify())
	.pipe(rename(path=>{path.extname = '.min.js';}))
	.pipe(sourcemaps.write('./'))
	.pipe(gulp.dest(settings.dest.js))
);

/*gulp.task('watch', ()=>{
	gulp.watch([].concat(settings.source.js, settings.source.jsTemplates, settings.source.jsScss), ['minify']);
});

gulp.task('build', gulp.series(['minify']));*/
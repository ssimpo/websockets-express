'use strict';

const settings = loadSettings();
const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const uglifyEs = require('gulp-uglify-es').default;
const rename = require('gulp-rename');
const ignore = require('gulp-ignore');
const rollup = require('rollup');
const rollupVinylAdaptor = require('@simpo/rollup-vinyl-adaptor');
const rollupNodeResolve = require('rollup-plugin-node-resolve');
const rollupPluginCommonjs = require('rollup-plugin-commonjs');
const rollupBabel = require('rollup-plugin-babel');
const rollupPluginJson = require('rollup-plugin-json');
const rollupNodeBuiltins = require('rollup-plugin-node-builtins');
const rollupNodeGlobals = require('rollup-plugin-node-globals');

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

function serverBuild(done) {
	rollupVinylAdaptor({
		rollup,
		input: {
			input: settings.source.server,
			plugins: [
				rollupNodeResolve(settings.nodeResolve || {}),
				rollupPluginCommonjs({}),
				rollupNodeGlobals(),
				rollupNodeBuiltins(),
				rollupPluginJson(),
				rollupBabel({
					generatorOpts: {...(settings.generatorOpts || {}), quotes:'single'},
					presets: settings.babelServer.presets || [],
					externalHelpers: true,
					sourceMaps: true,
					plugins: ['@babel/plugin-external-helpers', 'lodash', ...settings.babelServer.plugins || []]
				})
			],
			external:['ws','type-is','path','events','depd','vary','mime','content-disposition','statuses','http','crypto']
		},
		output: {
			format: 'cjs',
			'name': 'WebSocketService',
			sourcemap: true
		}
	})
		.pipe(sourcemaps.init({loadMaps: true}))
		.pipe(rename(path=>{
			path.dirname = '';
			path.basename = 'websocket-express';
			path.extname = '.development.js';
		}))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(settings.dest.server))
		.pipe(ignore.exclude('*.map'))
		.pipe(uglifyEs({}))
		.pipe(rename(path=>{
			path.basename = 'websocket-express';
			path.extname = '.production.min.js';
		}))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(settings.dest.server))
		.on('end', done);
}

function browserBsonBuild(done) {
	rollupVinylAdaptor({
		rollup,
		input: {
			input: settings.source.browserBson,
			plugins: [
				rollupNodeResolve(settings.nodeResolve || {}),
				rollupPluginCommonjs({}),
				rollupNodeGlobals(),
				rollupNodeBuiltins(),
				rollupPluginJson(),
				rollupBabel({
					generatorOpts: {...(settings.generatorOpts || {}), quotes:'double'},
					presets: settings.babelBrowser.presets || [],
					externalHelpers: true,
					sourceMaps: true,
					plugins: ['@babel/plugin-external-helpers', 'lodash', ...settings.babelBrowser.plugins || []]
				})
			]
		},
		output: {
			format: 'umd',
			'name': 'BSON',
			sourcemap: true
		}
	})
		.pipe(sourcemaps.init({loadMaps: true}))
		.pipe(rename(path=>{
			path.dirname = '';
			path.basename = 'bson';
			path.extname = '.development.js';
		}))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(settings.dest.browser))
		.pipe(ignore.exclude('*.map'))
		.pipe(uglifyEs({}))
		.pipe(rename(path=>{
			path.basename = 'bson';
			path.extname = '.production.min.js';
		}))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(settings.dest.browser))
		.on('end', done);
}

function browserBuild(done) {
	rollupVinylAdaptor({
		rollup,
		input: {
			input: settings.source.browser,
			plugins: [
				rollupNodeResolve(settings.nodeResolve || {}),
				rollupPluginCommonjs({include: './node_modules/**'}),
				rollupPluginJson(),
				rollupBabel({
					generatorOpts: {...(settings.generatorOpts || {}), quotes:'double'},
					presets: settings.babelBrowser.presets || [],
					externalHelpers: true,
					sourceMaps: true,
					plugins: ['@babel/plugin-external-helpers', 'lodash', ...settings.babelBrowser.plugins || []]
				})
			]
		},
		output: {
			format: 'umd',
			'name': 'WebSocketService',
			sourcemap: true
		}
	})
		.pipe(sourcemaps.init({loadMaps: true}))
		.pipe(rename(path=>{
			path.dirname = '';
			path.basename = 'websocket-express';
			path.extname = '.development.js';
		}))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(settings.dest.browser))
		.pipe(ignore.exclude('*.map'))
		.pipe(uglifyEs({}))
		.pipe(rename(path=>{
			path.basename = 'websocket-express';
			path.extname = '.production.min.js';
		}))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(settings.dest.browser))
		.on('end', done);
}

gulp.task('minify', done=>{
	const actions = [serverBuild, browserBuild, browserBsonBuild];
	let count = actions.length;

	const _done = ()=>{
		count--;
		if (count <= 0) done();
	};

	actions.forEach(action=>setImmediate(()=>action(_done)));
});

/*gulp.task('watch', ()=>{
	gulp.watch([].concat(settings.source.js, settings.source.jsTemplates, settings.source.jsScss), ['minify']);
});

gulp.task('build', gulp.series(['minify']));*/
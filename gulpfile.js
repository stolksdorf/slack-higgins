const vitreumTasks = require('vitreum/tasks');
const gulp = require('gulp');


const gulp = vitreumTasks(gulp, {
	entryPoints: [
		'./client/pins'
	],

	DEV: true,
	buildPath: './build/',
	pageTemplate: './client/template.dot',
	projectModules: [],
	additionalRequirePaths : ['./node_modules'],
	assetExts: ['*.svg', '*.png', '*.jpg', '*.pdf', '*.eot', '*.otf', '*.woff', '*.woff2', '*.ico', '*.ttf'],
	serverWatchPaths: [],
	serverScript: 'higgins.js',
	libs: [
		'react',
		'react-dom',
		'lodash',
		'classnames',

		'moment'
	],
	clientLibs: [],
});

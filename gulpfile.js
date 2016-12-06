var gulp = require('gulp');
var ts = require('gulp-typescript');
var merge = require('merge2');  
var sourcemaps = require('gulp-sourcemaps');
var runSequence = require('run-sequence');
var del = require('del');
var rename = require('gulp-rename');
var jasmine = require('gulp-jasmine');
var JasmineConsoleReporter = require('jasmine-console-reporter');
var typedoc = require("gulp-typedoc");
var istanbul = require('gulp-istanbul');
var remapIstanbul = require('remap-istanbul/lib/gulpRemapIstanbul');
var coverageEnforcer = require("gulp-istanbul-enforcer");

var tsProject = ts.createProject('tsconfig.json', { 
	declaration: false,
	rootDir: "./src", 
	noResolve: false
}, ts.reporter.fullReporter(true));

gulp.task('build', function() {
 	return gulp.src('src/lib/**/*.ts')
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(tsProject())
		.pipe(sourcemaps.write('./')) 
		.pipe(gulp.dest('bin/lib'));
 });

gulp.task('clean', function() {
	return del(['bin/**/*']);
});

gulp.task('docs-clean', function() {
	return del(['doc/']);
});

gulp.task('test-build', function(done) {
 	return gulp.src('src/spec/test-*.ts')
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(tsProject())
		.pipe(rename({ extname: '.spec.js' }))
		.pipe(sourcemaps.write('./')) 
		.pipe(gulp.dest('bin/test/spec'));
});

gulp.task('test-coverage', function(done) {
 	return gulp.src('src/lib/**/*.ts')
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(tsProject())
		// .pipe(istanbul())
		.pipe(sourcemaps.write('./')) 
		.pipe(gulp.dest('bin/test/lib'));
});

gulp.task('remap-istanbul-reports', function () {
    return gulp.src('bin/test/coverage/coverage-final.json')
        .pipe(remapIstanbul({
            reports: {
                'json': 'bin/test/coverage/typescript/coverage-final.json',
                'html': 'bin/test/coverage/typescript/lcov-report'
            }
        }));
});

gulp.task('test-run', function() {
	return gulp.src('bin/test/spec/*.spec.js')
		.pipe(jasmine({
	        timeout: 10000,
	        includeStackTrace: false,
	        reporter: new JasmineConsoleReporter({
				colors: 2,           // (0|false)|(1|true)|2 
				cleanStack: 1,       // (0|false)|(1|true)|2|3 
				verbosity: 4,        // (0|false)|1|2|(3|true)|4 
				listStyle: 'indent', // "flat"|"indent" 
				activity: false
			})
	    }))
		.pipe(istanbul.writeReports({
			dir: "bin/test/coverage"
		}))
		.pipe(istanbul.enforceThresholds({ thresholds: { global: 50 } }));
});

gulp.task('test', function(done) {
    runSequence('test-build', 'test-coverage', 'test-run', function(){  
				//'remap-istanbul-reports', function() {
        console.log('test completed.');
        done();
    });
});

gulp.task("docs", ['docs-clean'], function() {
    return gulp
        .src(["./src/lib/**/*.ts"])
        .pipe(typedoc({
            module: "commonjs",
            target: "es6",
            out: "./doc/",
            name: "Tree-Gateway",
			includeDeclarations: true,
			experimentalDecorators: true,
			emitDecoratorMetadata: true,
			excludeExternals: true,

			// TypeDoc options (see typedoc docs) 
			version: true,
			// json: "output/to/file.json"
 
			// theme: "/path/to/my/theme",
			ignoreCompilerErrors: true
        }))
    ;
});

gulp.task('release', function(done) {
    runSequence('clean', 'build', 'test', 'docs', function() {
        console.log('release created.');
        done();
    });
});

gulp.task('watch', ['build'], function() {
    gulp.watch('src/**/*.ts', ['build']);
});
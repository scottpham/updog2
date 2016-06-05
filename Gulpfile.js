var fs = require('fs'),
  gulp = require('gulp'),
  browserSync = require('browser-sync'),
  webpack = require('webpack-stream'),
  webpackConfig = require('./webpack.config.js'),
  sass = require('gulp-ruby-sass'),
  gutil = require('gulp-util'),
  sourcemaps = require('gulp-sourcemaps'),
  del = require('del'),
  runSequence = require('run-sequence'),
  useref = require('gulp-useref'),
  lazypipe = require('lazypipe'),
  uglify = require('gulp-uglify'),
  filter = require('gulp-filter'),
  cleanCSS = require('gulp-clean-css'),
  htmlmin = require('gulp-htmlmin'),
  htmlreplace = require('gulp-html-replace');

var bs = browserSync.create();
// TODO:
// finish build script
// css autoprefixing
// should move dev/build location?
// move some config to package.json

gulp.task('scripts:dev', function() {
  return gulp.src('app/scripts/main.js')
    .pipe(webpack({
      watch: true,
      devtool: 'source-map',
      output: {
        path: __dirname + '/',
        filename: 'bundle.js'
      }
    }))
    .pipe(gulp.dest('app/dev/'))
    .pipe(bs.reload({
      stream: true
    }));
});

gulp.task('html:dev', function() {
  return gulp.src('app/index.html')
    .pipe(htmlreplace({
      maincss: 'main.css',
      mainjs: 'bundle.js'
    }))
    .pipe(useref({}, lazypipe().pipe(sourcemaps.init, {
      loadMaps: true
    })))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('app/dev/'));
});

gulp.task('clean:dev', function() {
  return del([
    'app/dev/**/*',
    'app/build/**/*'
  ]);
});

gulp.task('browserSync', function() {
  bs.init({
    server: {
      baseDir: 'app/dev/'
    }
  });
})

gulp.task('style:dev', function() {

  return sass('app/styles/*.scss', {
      sourcemap: true
    })
    .pipe(sourcemaps.write('./', {
      includeContent: false,
      sourceRoot: '/app/styles'
    }))
    .pipe(gulp.dest('app/dev/'))
    .pipe(bs.reload({
      stream: true,
      match: '**/*.css'
    }));
});

gulp.task('move:dev', function() {
  return gulp.src(['app/images/**/*.*', 'app/data/**/*.*'], {
      base: './app/'
    })
    .pipe(gulp.dest('app/dev/'));
});

gulp.task('reload', function() {
  bs.reload();
});

// watchers
gulp.task('watch', function() {
  // run style:dev on all scss files
  gulp.watch('app/styles/*.scss', ['style:dev']);
  // run scripts:dev when index.html changes
  gulp.watch(['app/*.html'], ['html:dev', 'reload']);
  // watch image and data files
  gulp.watch(['app/images/**/*.*', 'app/data/**/*.*'], ['move:dev']);
});

gulp.task('default', function(callback) {
  runSequence(
    'clean:dev', ['style:dev', 'scripts:dev', 'html:dev', 'watch',
      'browserSync', 'move:dev'
    ]);
});

////// build tasks/////////
gulp.task('move:build', function() {

  var filterHTML = filter(['app/dev/**/*.html'], {
    restore: true
  });
  var filterCSS = filter(['app/dev/**/*.css'], {
    restore: true
  });

  // filter out sourcemaps
  return gulp.src(['app/dev/**/*', '!app/dev/**/*.map'])
    .pipe(filterCSS)
    .pipe(cleanCSS({
      compatibility: 'ie8'
    }))
    .pipe(filterCSS.restore)
    .pipe(filterHTML)
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(filterHTML.restore)
    .pipe(gulp.dest('app/build/'));

});

gulp.task('scripts:build', function() {
  return gulp.src('app/scripts/main.js')
    .pipe(webpack({
      output: {
        path: __dirname + '/',
        filename: 'bundle.js'
      }
    }))
    .pipe(uglify())
    .pipe(gulp.dest('app/dev/'));
});

// build
gulp.task('build', function() {
  runSequence(
    'clean:dev', ['style:dev', 'scripts:build', 'html:dev', 'move:dev'],
    'move:build'
  );
});

//get s3 config strings
var config = JSON.parse(fs.readFileSync('credentials.json'));
//  get package.json object
var packageJSON = JSON.parse(fs.readFileSync('package.json'));

var path = require('path');

var s3Credentials = {
  "key": config.accessKeyId,
  "secret": config.secretAccessKey,
  "bucket": 'apps-revealnews-org',
  "region": "us-east-1"
};
//load s3
var s3 = require("gulp-s3-deploy");
var rename = require('gulp-rename');

gulp.task('s3', function() {
  gulp.src('./app/build/**/*')
    .pipe(rename(function(path) {
      //rename the path with a subfolder name
      path.dirname = packageJSON.name + '/' + path.dirname;
    }))
    .pipe(s3(s3Credentials));
});

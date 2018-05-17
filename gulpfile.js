var forceDeploy = require('gulp-jsforce-deploy');
var gulp = require('gulp');
var del = require('del');
var zip = require('gulp-zip');
var rename = require("gulp-rename");
var replace = require('gulp-replace');
var file = require('gulp-file');
var dotenv = require('dotenv');
dotenv.config();

// define variables from process.env
const pageName = process.env.PAGE_NAME;
const apiVersion = process.env.API_VERSION;
const resources = process.env.RESOURCE_NAME;
const baseHref = process.env.BASE_HREF;
const devResources = process.env.DEV_RESOURCES_URL;
const distPath = process.env.DIST_PATH || 'dist';

let controller = process.env.CONTROLLER;
controller = controller ? `controller="${controller}"` : ``;

let extensions = process.env.EXTENSIONS;
extensions = extensions ? `extensions="${extensions}"` : ``;

const otherPageAttrs = `sidebar="false" standardStylesheets="false" showHeader="false"`;

// Here we describe meta.xml files to package
const pageMetaXML = `<?xml version="1.0" encoding="UTF-8"?>
<ApexPage xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>${apiVersion}</apiVersion>
    <availableInTouch>false</availableInTouch>
    <confirmationTokenRequired>false</confirmationTokenRequired>
    <label>${pageName}</label>
</ApexPage>`;

const resourcesMetaXML = `<?xml version="1.0" encoding="UTF-8"?>
<StaticResource xmlns="http://soap.sforce.com/2006/04/metadata">
    <cacheControl>Public</cacheControl>
    <contentType>application/x-zip-compressed</contentType>
</StaticResource>`;

const packageXML = `<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <types>
        <members>*</members>
        <name>ApexPage</name>
    </types>
    <types>
        <members>*</members>
        <name>StaticResource</name>
    </types>
    <version>${apiVersion}</version>
</Package>`;

// Task to remove package folder 
gulp.task('rm', function () { del(['./package']) });

gulp.task('create-package', function () {
  gulp.src('./package')
  .pipe(file(`package.xml`, packageXML))
    .pipe(gulp.dest('package/'));
});

gulp.task('page_to_prod', function () {
  gulp.src([distPath+'/index.html'])
    .pipe(replace('<!doctype html>', ''))
    .pipe(replace('<html lang="en">', `<apex:page ${otherPageAttrs} ${controller} ${extensions}>`))
    .pipe(replace(`<base href="${baseHref}">`, `<base href="${baseHref}"/>`))
    .pipe(replace('<meta charset="utf-8">', `<meta charset="utf-8"/>`))
    .pipe(replace('initial-scale=1">', `initial-scale=1"/>`))
    .pipe(replace('href="favicon.ico">', `href="{!URLFOR($Resource.${resources}, 'favicon.ico')}"/>`))
    .pipe(replace(`<script type="text/javascript" src="`, `<script type="text/javascript" src="{!URLFOR($Resource.${resources}, '`))
    .pipe(replace(`.js"></script>`, `.js')}"></script>`))
    .pipe(replace('</body>', `<script type="text/javascript">
    window._VfResourses = '{!URLFOR($Resource.${resources})}';
    </script></body>`))
    .pipe(replace('</html>', `</apex:page>`))
    .pipe(rename(function (path) {
      path.dirname += "/pages";
      path.basename = `${pageName}`;
      path.extname = ".page"
    }))
    .pipe(file(`pages/${pageName}.page-meta.xml`, pageMetaXML))
    .pipe(gulp.dest('package/'));
});
gulp.task('page_to_dev', function () {
  gulp.src([distPath+'/index.html'])
    .pipe(replace('<!doctype html>', ''))
    .pipe(replace('<html lang="en">', `<apex:page ${otherPageAttrs} ${controller} ${extensions}>`))
    .pipe(replace(`<base href="${baseHref}">`, `<base href="${baseHref}"/>`))
    .pipe(replace('<meta charset="utf-8">', `<meta charset="utf-8"/>`))
    .pipe(replace('initial-scale=1">', `initial-scale=1"/>`))
    .pipe(replace('href="favicon.ico">', `href="${devResources}/favicon.ico"/>`))
    .pipe(replace(`<script type="text/javascript" src="`, `<script type="text/javascript" src="${devResources}/`))
    .pipe(replace('</body>', `<script type="text/javascript">
    window._VfResourses = '${devResources}';
    </script>
    </body>`))
    .pipe(replace('</html>', `</apex:page>`))
    .pipe(rename(function (path) {
      path.dirname += "/pages";
      path.basename = `${pageName}`;
      path.extname = ".page"
    }))
    .pipe(file(`pages/${pageName}.page-meta.xml`, pageMetaXML))
    .pipe(gulp.dest('package/'));
});

gulp.task('staticresources', function () {
  gulp.src('./'+distPath+'/**')
    .pipe(zip(`${resources}.resource`))
    .pipe(file(`${resources}.resource-meta.xml`, resourcesMetaXML))
    .pipe(gulp.dest('package/staticresources/'));
});

gulp.task('build-static', ['create-package', 'staticresources'])
gulp.task('build-package', ['create-package', 'page_to_prod', 'staticresources'])
gulp.task('build-dev-package', ['create-package', 'page_to_dev'])

gulp.task('deploy', function () {
  gulp.src('./package/**', { base: "." })
    .pipe(zip('package.zip'))
    .pipe(forceDeploy({
      username: process.env.SF_USERNAME,
      password: process.env.SF_PASSWORD,
      loginUrl: process.env.LOGIN_URL
    }))
});

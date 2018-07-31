// Usage:
// node ..\..\tools\util\updateDependencyInPackageJson.js root-path-for-package.json-files new-version dependency-name1 dependency-name2...
// node ..\..\tools\util\updateDependencyInPackageJson.js . 4.0.1-preview1.3456 botbuilder botbuilder-prompts
console.log('Started ' + (new Date()));
//console.log(process.argv);
var myArgs = process.argv.slice(2);
var rootPath = myArgs[0];
//rootPath = 'C:\\Github\\Microsoft\\botbuilder-js\\libraries';
var newVersion = myArgs[1];
var dependencies = myArgs.slice(2);
console.log('newVersion =', newVersion);
console.log('dependencies =', dependencies);
//var dependencyName = myArgs[2];

function updateDependencies(filePath) {
    var fs = require('fs')
    fs.readFile(filePath, 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }

        var result = '';
        dependencies.forEach(function (dependency) {
            var findString = new RegExp('("dependencies":)(.+?)("' + dependency + '":\\s*")([^\/"]+)', "gms")
            var replaceString = '$1$2$3' + newVersion;
            result = data.replace(findString, replaceString);
            data = result;
        });

        fs.writeFile(filePath, result, 'utf8', function (err) {
            if (err) return console.log(err);
        });
    });
}

function getPackageJsonFiles() {
    // List all files in a directory in Node.js recursively in a synchronous fashion
    var filelist = [];
    var dir = rootPath;
    // console.log('dir = ', dir);
    var walkSync = function (dir, filelist) {
        var path = path || require('path');
        var fs = fs || require('fs'),
            files = fs.readdirSync(dir);
        filelist = filelist || [];
        // console.log('files = ', files);
        files.forEach(function (file) {
            if (fs.statSync(path.join(dir, file)).isDirectory()) {
                if (!file.includes('node_modules')) {
                    filelist = walkSync(path.join(dir, file), filelist);
                }
            }
            else {
                filelist.push(path.join(dir, file));
            }
        });
        return filelist;
    };
    var result0 = walkSync(dir, filelist);
    var result = result0.filter(path => path.includes('package.json'));
    return result;
}

var files = getPackageJsonFiles();
console.log('files = ');
console.log(files);

files.forEach(function (file) {
    console.log('updating ' + file);
    updateDependencies(file);
});
console.log('Ended ' + (new Date()));

// Usage:
// node ..\..\tools\util\updateDependencyInPackageJson.js path-to-package.json new-version dependency-name1 dependency-name2...
// node ..\..\tools\util\updateDependencyInPackageJson.js ./package.json 4.0.1-preview1.3456 botbuilder botbuilder-prompts
console.log('Started ' + (new Date()));
//console.log(process.argv);
var myArgs = process.argv.slice(2);
console.log('myArgs: ', myArgs);
var packagePath = myArgs[0];
var newVersion = myArgs[1];
//var dependencies = myArgs.slice(2);
var dependencyName = myArgs[2];

function updateDependency() {
    var fs = require('fs')
    fs.readFile(packagePath, 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        //var result = data.replace(/string to be replaced/g, 'replacement');
        //var result = data.replace(/"botbuilder":\s*"([^\/"]+)/g, '"botbuilder": "4.0.1-preview1.3456');
        //var findString = new RegExp('"' + dependencyName + '":\\s*"([^\\/"]+)', "g") 
        //var replaceString = '"' + dependencyName + '": "' + newVersion;
        var findString = new RegExp('("dependencies":)(.+?)("' + dependencyName + '":\\s*")([^\/"]+)', "gms") 
        var replaceString = '$1$2$3' + newVersion;
        var result = data.replace(findString, replaceString);

        fs.writeFile('packageX.json', result, 'utf8', function (err) {
            if (err) return console.log(err);
        });
    });
}

updateDependency();
console.log('Ended ' + (new Date()));

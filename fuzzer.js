var fs = require('fs');
var Random = require('random-js');
var randomizer = new Random(Random.engines.mt19937().autoSeed());
var walk = require('walk');
var path = require('path');

//------------------------------------------------------------------------------------------------------------------
// Check if the line contains an iterator or a conditional statement
function isIteratorCondition(word) {
    if (word != undefined) {
        if (word.search('if') != -1) {
            return true;
        } else if (word.search('while') != -1) {
            return true;
        }
    }
    return false;
};
//------------------------------------------------------------------------------------------------------------------
// This is where the fuzzing takes place
// TODO - refactor the variables
function fuzz(file) {

    var content = fs.readFileSync(file, 'utf-8');

    y = content.split('\n');

    for (var i = 0; i < y.length; i++) {

        if(y[i].match(/(.*\@.*)/i)){
            continue;
        }
        var st = y[i].match(/\=\s*\"[a-zA-Z0-9]*\"/i);
        
        if (st != undefined) {            
            if (randomizer.bool(0.15)) {
                // Reverse the string
                y[i] = y[i].replace(st[0], st[0].split('').reverse().join(''));
            }
            if (randomizer.bool(0.20)) {
                // Replace with a substring
                var a = randomizer.integer(0, st[0].length)
                var b = randomizer.integer(0, st[0].length)
                y[i] = y[i].replace(st[0], "\"" + st[0].substring(a, b) + "\"");

            }
            if (randomizer.bool(0.20)) {
                // Delete random characters and replace
                var a = randomizer.integer(0, st[0].length)
                var b = randomizer.integer(0, st[0].length)
                var new_string = st[0].split('').splice(1, st[0].length - 2);
                new_string = new_string.splice(a, b).join("");                
                y[i] = y[i].replace(st[0], "\"" + new_string + "\"");

            }

            if ((randomizer.bool(0.30))) {
                // Replace with a random string
                y[i] = y[i].replace(st[0], "\"" + randomizer.string(st[0].length) + "\"");
            }

        }

        //var num = y[i].match(/\=\s*([0-9])*$/);
        //var num = y[i].match(/\=\s*([0-9])*$/);
        var num = y[i].match(/(<{1}=?|>{1}=?)\s*([0-9]+)/);
        
        if(num != undefined){
            
            var actual_number = num[2];
            var new_number = randomizer.integer(0, 100);

            if (randomizer.bool(0.80)) {                
                y[i] = y[i].replace(actual_number, new_number);                
            }            
        }
        
        if (randomizer.bool(0.20)) {
            if (isIteratorCondition(y[i])) {
                y[i] = y[i].replace("<=", ">=");
            }
        } else if (randomizer.bool(0.80)) {
            if (isIteratorCondition(y[i])) {
                y[i] = y[i].replace(">=", "<=");
            }
        }

        if (randomizer.bool(0.20)) {
            if (isIteratorCondition(y[i])) {
                y[i] = y[i].replace("<", ">");
            }
        } else if (randomizer.bool(0.80)) {
            if (isIteratorCondition(y[i])) {
                y[i] = y[i].replace(">", "<");
            }
        }

        if (randomizer.bool(0.20)) {
            if (isIteratorCondition(y[i])) {
                y[i] = y[i].replace("==", "!=");
            }
        } else if (randomizer.bool(0.80)) {
            if (isIteratorCondition(y[i])) {
                y[i] = y[i].replace("!=", "==");
            }
        }

        if (randomizer.bool(0.20)) {
            if (isIteratorCondition(y[i])) {
                y[i] = y[i].replace("&&", "||");
            }
        } else if (randomizer.bool(0.80)) {
            if (isIteratorCondition(y[i])) {
                y[i] = y[i].replace("||", "&&");
            }
        }

    }

    y = y.join("\n");
    return y;
}
//------------------------------------------------------------------------------------------------------------------
// Write the fuzzed content to the file
function write(fileName, fileContent) {
    fs.writeFile(fileName, fileContent, function (err) {
        if (err) {
            return console.log(err);
        }        
    });
}
//------------------------------------------------------------------------------------------------------------------
function traverseDir(dir, result) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            traverseDir(fullPath, result);
        } else {
            if (fullPath.match(/^(.+)\/([^/]+).java$/g)) {
                result.push(fullPath);
            }

        }
    });

    return result;
}
//------------------------------------------------------------------------------------------------------------------
function main() {

    var dir = "/home/tushar/Desktop/Fuzzer/edu/";
    var files = [];

    files = traverseDir(dir, files);

    for (var i = 0; i < files.length; i++) {
        var content = fuzz(files[i]);
        write(files[i], content);
    }
}
//------------------------------------------------------------------------------------------------------------------
main()
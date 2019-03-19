var fs = require('fs');
var Random = require('random-js');
var randomizer = new Random(Random.engines.mt19937().autoSeed());
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
function fuzz(file) {

    var content = fs.readFileSync(file, 'utf-8');

    var line = content.split('\n');

    for (var i = 0; i < line.length; i++) {

        if (line[i].match(/(.*\@.*)/i)) {
            continue;
        }
        //var old_string = line[i].match(/\=\s*\"[a-zA-Z0-9]*\"/i);
        var old_string = line[i].match(/(?:\=)\s*(\"[a-zA-Z0-9]*\")/i);

        if (old_string && old_string[1]) {
            console.log(old_string);
            if (randomizer.bool(0.15)) {
                // Reverse the string
                line[i] = line[i].replace(old_string[1], old_string[1].split('').reverse().join(''));
            }
           // old_string[1] = old_string[1].replace(/\"/g, "");
            if (randomizer.bool(0.20)) {
                // Replace with a substring
                var a = randomizer.integer(0, old_string[1].length - 1)
                var b = randomizer.integer(a, old_string[1].length - 1)
                line[i] = line[i].replace(old_string[1], "\"" + old_string[1].replace(/\"/g, "").substring(a, b) + "\"");

            }
            if (randomizer.bool(0.20)) {
                // Delete random characters and replace
                var new_string = old_string[1].replace(/\"/g, "").split('').splice(1, old_string[1].length - 2);
                var a = randomizer.integer(0, new_string.length - 1)
                var b = randomizer.integer(a, new_string.length - 1)
                new_string = new_string.splice(a, b).join("");
                line[i] = line[i].replace(old_string[1], "\"" + new_string + "\"");

            }

            if ((randomizer.bool(0.30))) {
                // Replace with a random string
                line[i] = line[i].replace(old_string[1], "\"" + randomizer.string(old_string[1].length - 1) + "\"");
            }

        }

        //var num = y[i].match(/\=\s*([0-9])*$/);
        //var num = y[i].match(/\=\s*([0-9])*$/);
        var num = line[i].match(/(<{1}=?|>{1}=?)\s*([0-9]+)/);

        if (num != undefined) {

            var actual_number = num[2];
            var new_number = randomizer.integer(0, 100);

            if (randomizer.bool(0.80)) {
                line[i] = line[i].replace(actual_number, new_number);
            }
        }

        if (randomizer.bool(0.10)) {
            if (isIteratorCondition(line[i])) {
                line[i] = line[i].replace("<=", ">=");
            }
        } else if (randomizer.bool(0.80)) {
            if (isIteratorCondition(line[i])) {
                line[i] = line[i].replace(">=", "<=");
            }
        }

        if (randomizer.bool(0.20)) {
            if (isIteratorCondition(line[i])) {
                line[i] = line[i].replace("<", ">");
            }
        } else if (randomizer.bool(0.25)) {
            if (isIteratorCondition(line[i])) {
                line[i] = line[i].replace(">", "<");
            }
        }

        if (randomizer.bool(0.15)) {
            if (isIteratorCondition(line[i])) {
                line[i] = line[i].replace("==", "!=");
            }
        } else if (randomizer.bool(0.80)) {
            if (isIteratorCondition(line[i])) {
                line[i] = line[i].replace("!=", "==");
            }
        }

        if (randomizer.bool(0.25)) {
            if (isIteratorCondition(line[i])) {
                line[i] = line[i].replace("&&", "||");
            }
        } else if (randomizer.bool(0.20)) {
            if (isIteratorCondition(line[i])) {
                line[i] = line[i].replace("||", "&&");
            }
        }

    }

    content = line.join("\n");
    return content;
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
function traverseDirectory(dir, result) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (file !== "models" && fs.lstatSync(fullPath).isDirectory()) {
            traverseDirectory(fullPath, result);
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

    //var dir = "/home/tushar/Desktop/iTrust2-v4/iTrust2/src/main/java/edu/";
    //var dir = "/home/tushar/Desktop/Devops-Project1/jenkins-server/";
    var dir = "/jenkins-server/iTrust2-v4/iTrust2/src/main/java/edu/";

    var files = [];

    files = traverseDirectory(dir, files);

    for (var i = 0; i < files.length; i++) {
        var content = fuzz(files[i]);
        write(files[i], content);
    }
}
//------------------------------------------------------------------------------------------------------------------
main()
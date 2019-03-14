console.log("Hello world!");

var fs = require('fs');

// Recursively get all the java files from the directory
var walk = function (dir, done) {
    var results = [];
    fs.readdir(dir, function (err, list) {
        if (err) return done(err);
        var i = 0;
        (function next() {
            var file = list[i++];
            if (!file) return done(null, results);
            file = dir + '/' + file;
            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function (err, res) {    
                        results = results.concat(res);
                        next();
                    });
                } else {
                    if (file.match(/^(.+)\/([^/]+).java$/g)) {
                        console.log(file);
                        results.push(file);
                    }
                    next();
                }
            });
        })();
    });

    return results;
};

var x = walk("/home/tushar/Desktop/Devops-Project1/jenkins-server/iTrust2-v4/iTrust2/src/main/java/edu", function (err, results) {
    if (err) throw err;
});

console.log("Results");
console.log(x);



// var file = 'EmergencyRecordForm.java'
// var content = fs.readFileSync(file, 'utf-8');

// data = content.split(' ');
// console.log(data);

// x = content.split('\n');

// for (var i = 0; i < x.length; i++) {
//     x[i] = x[i].replace("<=", ">=");
// }

// x = x.join("\n");





// fs.writeFile("test.java", x, function (err) {
//     if (err) {
//         return console.log(err);
//     }
//     console.log("The file was saved!");
// });

^(.(.*\.html))*$
// Script to import users from csv

// Read the name of the file
var filename = process.argv.slice(2)[0];
if (filename) {
    console.log("File: " + filename);
} else {
    console.log('Filename not specified');
    process.exit(-1);
}

// Import csv-parser module
var csv = require('csv-parser');

// Import fs module
var fs = require('fs');

// Define user with parameterized constructor
class User {
    constructor(name, type, language, color, password, classroom) {
        this.name = name;
        this.type = type;
        this.language = language;
        this.color = color;
        this.password = password;
        if (classroom)
            this.classroom = classroom;
    }
}

// Initialize the array that will contains all the users read from CSV
var Users = [];

// Trim and lowercase string
function cleanString(string) {
    if(!string) return;
    string = string.trim();
    string = string.toLowerCase();
    return string;
}

// Validate color string
function isValidColor(color) {
    try {
        color = JSON.parse(color);
    } catch (e) {
        return false;
    }
    if (!color.stroke || !color.fill) return false;
    return true
}

// Generate random password
function generatePassword(length) {
    var password = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    
    for (var i = 0; i < length; i++)
        password += possible.charAt(Math.floor(Math.random() * possible.length));
    
    return password;
}

// Validate data row
function validateUserRow(user, index) {
    if(!user.name) {
        console.log("Row: " + (index + 1) + " -> Username is invalid\nSkipping...");
        return;
    }

    user.type = cleanString(user.type);
    if(!user.type) {
        user.type = "student";
    }

    // ToDo: Validate language from an array of valid languages
    user.language = cleanString(user.language);
    if(!user.language) {
        user.language = "en";
    }

    user.color = cleanString(user.color);
    if(!isValidColor(user.color)) {
        // ToDo: Randomize Color
        user.color = '{"stroke":"#ff0000", "fill":"#0000ff"}';
    }

    // ToDo: Get minimum password length from .ini file
    if(!user.password || typeof user.password != "string" || user.password.length < 4) {
        console.log("Row: " + (index + 1) + " -> User: " + user.name + " -- Password is invalid\nGenerating random password...");
        user.password = generatePassword(8);
    }

    user.classroom = user.classroom || "";

    return user;
}

console.log("Reading and validating file");
var dataIndex = 0;
// Read the CSV file
fs.createReadStream(filename)
    .on('error', function(err) {
        console.log(err);
        // ToDo: Check safely terminate script
        throw err;
    })
    .pipe(csv())
    .on('data', function(row) {
        dataIndex++;
        var validRow = validateUserRow(row, dataIndex);
        if (validRow) Users.push(new User(validRow.name, validRow.type, validRow.language, validRow.color, validRow.password, validRow.classroom));
    })
    .on('end', function() {
        console.log('Finished processing CSV file');
        console.log(Users);
    });


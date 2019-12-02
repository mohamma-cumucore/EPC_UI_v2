var mysql = require('mysql');
var fs = require('fs');
var contents = fs.readFileSync(process.cwd()+"/public/settings.json");
var jsonContent = JSON.parse(contents);
module.exports.getConnection = function() {
    // Test connection health before returning it to caller.
    if ((module.exports.connection) && (module.exports.connection._socket)
            && (module.exports.connection._socket.readable)
            && (module.exports.connection._socket.writable)) {
        return module.exports.connection;
    }
    console.log(((module.exports.connection) ?
            "UNHEALTHY SQL CONNECTION; RE" : "") + "CONNECTING TO SQL.");
            connection = mysql.createConnection({
              host     : jsonContent.mysql_host,
              user     : jsonContent.mysql_user_name,
              password : jsonContent.mysql_password,
              database : jsonContent.mysql_db_name,
              multipleStatements: true
            },{typeCast: false});          
    connection.connect(function(err) {
        if (err) {
            console.log("SQL CONNECT ERROR: " + err);
        } else {
            console.log("SQL CONNECT SUCCESSFUL.");
        }
    });
    connection.on("close", function (err) {
        console.log("SQL CONNECTION CLOSED.");
    });
    connection.on("error", function (err) {
        console.log("SQL CONNECTION ERROR: " + err);
    });
    module.exports.connection = connection;
    return module.exports.connection;
}
// Open a connection automatically at app startup.
module.exports.getConnection();
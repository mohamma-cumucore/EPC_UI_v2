const express = require('express');
const bodyParser = require('body-parser');
var routes = require('./routes/route.js');
var fs = require('fs');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
const path = require('path');
//var memstore = require('session-memory-store')(session);
var session = require('express-session');
const flash = require('connect-flash');
const ejs = require('ejs');
const app = express();
const db = require('./config/db_config.js');
var contents = fs.readFileSync(process.cwd()+"/public/settings.json");
var jsonContent = JSON.parse(contents);
//app.use(enbroutes);
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('keyboard cat'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));
app.use(bodyParser.urlencoded({extended: false}));
//var sessionStore = new memstore({ expires: 160 * 60 * 1000, debug: true });
app.use(session({
    secret: 'keyboard cat',
    resave: true,    
    saveUninitialized: true,
    activeDuration: 5 * 60 * 1000,
    cookie: { maxAge: 24*60*60000 }
}))
app.use(flash());
app.use('/',routes);
app.listen(jsonContent.port,function(){
  
});






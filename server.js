var express = require('express');
var morgan = require('morgan'); // Charge le middleware de logging
var logger = require('log4js').getLogger('Server');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var mysql = require('mysql');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var url = require('url');

var app = express(); 
var connection = mysql.createConnection({
				  host     : 'localhost',
				  port     : '3306',
				  user     : 'test',
				  password : 'test',
				  database: 'pictionnary'
				});	

// config
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'cestunsecret' })); // session secret
app.use(morgan('combined')); // Active le middleware de logging
app.use(passport.initialize());
app.use(flash());
app.use(passport.session());
app.use(express.static(__dirname + '/public')); // Indique que le dossier /public contient des fichiers statiques (middleware chargé de base)

require('./config/passport')(passport);

logger.info('server start');

// route
app.get('/', function(req, res)
{
    res.render('main', {user:''});
});

 app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));
	
app.get('/login', function(req, res)
{
	res.render('login', {user:''});
});

app.get('/paint', isLoggedIn, function(req, res)
{
    res.render('paint', {user:req.user});
});
app.post('/paint',function(req, res)
{
	var draw = new Object();
	draw.dessin = req.body.picture;
	draw.commandes = req.body.drawingCommands;
	console.log(req.user.id);
	draw.id_utilisateur= req.user.id;
	var insertquery = {dessin : req.body.picture, commandes : req.body.drawingCommands, id_utilisateur: req.user.id};console.log(insertquery);
	connection.query('insert into drawings set ?',insertquery, function(error, rows) 
	{ if (error)
		{
			
			res.writeHead (200);
			res.end ('error boulet');
		}
		else
		{
			res.redirect ('/profile');
		}
	})
	

});

app.get('/guess', isLoggedIn, function(req, res)
{ 	
	var query  = url.parse(req.url,true).query;
	console.log (query);
	  connection.query('SELECT commandes FROM drawings WHERE id_utilisateur=' + req.user.id +' and id='+query['id']+';', function(err, rows)
        {
            if (err)
            { 
                res.writeHead(200);
                res.end('error');
            } 
            else
            {
                res.render('guess', { user: req.user , commandes : rows[0].commandes });
            }
        });
})

app.get('/dessin',isLoggedIn, function(req, res)
{
	  
       
        connection.query('SELECT id FROM drawings WHERE id_utilisateur=' + req.user.id +';', function(err, rows)
        {
            if (err)
            { 
                res.writeHead(200);
                res.end('error');
            } 
            else
            {
                res.render('dessin', { user : req.user, draw : rows });
            }
        });
})

app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));	

app.get('/profile', function(req, res)
{
	res.render('profile', {user:req.user});
});

app.get('/signup', function(req, res)
{
	res.render('signup', {user:''});
});

app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
app.get('/logout', function(req, res) 
{
        req.logout();
        res.redirect('/');
});
function isLoggedIn(req, res, next) 
{

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
    {
        return next();
    }

    res.redirect('/');
}
app.listen(1313);




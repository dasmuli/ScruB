var express = require('express')
,   app     = express()
,   server  = require('http').createServer(app)
,   combo   = require('combohandler')
,   minify  = require('express-minify')
,   Cacher  = require('cacher')
,   conf    = require('./config.json');

var root = '/public';

server.listen(conf.port);

if ('production' == app.get('env'))
{
   var cacher = new Cacher();
   app.disable('etag'); // added for Safari

   //app.get('/*', function(req, res, next){ 
	//        res.setHeader('Last-Modified', (new Date()).toUTCString());
	//	  next(); 
   //});

   cacher.genCacheKey = function(req) {
	   // cache: remember gzip support in cache key
   return req.originalUrl + req.accepts('gzip')     }

   //cacher.on("hit", function(key) {
   //  console.log("woohoo!")
   //})
   //cacher.on("miss", function(key) {
   //  console.log("doh!")
   //})

   app.use( cacher.cache( 'days', 1 ) );

   app.use( express.compress() );

   app.use( minify() );

   app.use( express.errorHandler() );
}

//app.use(app.router);

app.get('/combohandler', combo.combine({rootPath: __dirname + root }), combo.respond);



   
if ('production' == app.get('env'))
{   
   var oneDay = 86400000;
   app.use(express.static(__dirname + root, { maxAge: oneDay } ));
}
else
{
   app.use(express.static(__dirname + root ));
}


// show index.html on '/'
app.get('/', function (req, res) {
	res.sendfile(__dirname + '/public/index.html');
});

var scrumServer = require( './ScrumServer.js' ).listen( server );

// portnumber in console
console.log('Server listening on http://127.0.0.1:' + conf.port + '/');

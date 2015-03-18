var express = require('express')
,   app     = express()
,   server  = require('http').createServer(app)
,   combo   = require('combohandler')
,   minify  = require('express-minify')
,   Cacher  = require('cacher')
,   conf    = require('./config.json');

var root = '/public';

app.use( function( req, res, next ) {
    console.log( "Incoming URL: " + req.url );
    req.url = req.url.replace( /\/[A-Za-z\d$\-_\.+!*]+\//, '/' );  // URL is parsed by socket!   
    console.log( "Outgoing URL: " + req.url );
    next();
});

server.listen(conf.port);

if ('production' == app.get('env'))
{
   var cacher = new Cacher();
   //app.disable('etag'); // added for Safari

   //app.get('/*', function(req, res, next){ 
	//        res.setHeader('Last-Modified', (new Date()).toUTCString());
	//	  next(); 
   //});

   cacher.genCacheKey = function(req) {
	   // cache: remember gzip support in cache key
       //console.log('Cache key: ' + req.originalUrl + req.accepts('gzip') );
   return req.originalUrl + req.accepts('gzip')     }

   cacher.genCacheTtl = function( res, origTtl )
   {
       if( res.statusCode >= 400 || res.statusCode == 304 )
       {
           return 0;
       }
       return origTtl;
   }

   app.use( cacher.cache( 'days', 1 ) );

   app.use( express.compress() );

   app.use( minify() );

   app.use( express.errorHandler() );
}


app.get('/combohandler', combo.combine({rootPath: __dirname + root }), combo.respond);



   
app.use(express.static(__dirname + root ));


// show index.html on '/'
app.get('/', function (req, res) {
	res.sendfile(__dirname + '/public/index.html');
});

var scrumServer = require( './ScrumServer.js' ).listen( server );

// portnumber in console
console.log('Server listening on http://127.0.0.1:' + conf.port + '/');

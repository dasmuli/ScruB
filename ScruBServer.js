var express = require('express')
,   app = express()
,   server = require('http').createServer(app)
,   io = require('socket.io').listen(server)
,   combo = require('combohandler')
,   minify = require('express-minify')
,   Cacher = require('cacher')
,   conf = require('./config.json')
,   scrumDB = require( './ScrumDB.js' );

var root = '/public';
var cacher = new Cacher();

server.listen(conf.port);

if ('production' == app.get('env'))
{
   //app.disable('etag'); // added for Safari

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


//////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////  Load scripts + data  ////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

// load scrumdata.js
var fs = require('fs');
eval( fs.readFileSync('public/ScrumDataManager.js')+'' );

// init test data
//scrumDataManager.InitTestData();

// connect scrumDataManager to scrumDB
var loadedData = scrumDB.LoadScrumDataSync( "Default" );
scrumDataArray = loadedData.scrumDataArray;
scrumDataManager.priorityStartId = loadedData.priorityStartId;
scrumDB.AddDataManager( scrumDataManager );
scrumDB.scrumDataArray = scrumDataArray;

//////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////  websocket + events  ////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

io.sockets.on('connection', function (socket) {
	socket.emit('chat', { zeit: new Date(), text: 'You are locked on to the server!' });
	socket.on('chat', function (data) {
		io.sockets.emit('chat', { zeit: new Date(), name: data.name || 'Anonym', text: data.text });
	});
	
	socket.on('updateScrumData', function (data) {
		scrumDataManager.UpdateData( data );
		io.sockets.emit('scrubdata', {
			featurename:			scrumDataArray[ data.id ].featurename,
			id: 					scrumDataArray[ data.id ].id,
			complexity: 			scrumDataArray[ data.id ].complexity,
			priority: 				scrumDataArray[ data.id ].priority,
			previousPriorityId: 	scrumDataArray[ data.id ].previousPriorityId
			});
	});
	
	socket.on('moveDataUp', function (data) {
		scrumDataManager.MovePriorityUp( data.id );
		io.sockets.emit( 'scrubmoveup', data.id );
	});
	
	// Send complete array data to client
	socket.emit('scrubfulldata', {
		dataArray:		scrumDataArray,
		priorityStartId:	scrumDataManager.priorityStartId,
	} );
});

// portnumber in console
console.log('Server listening on http://127.0.0.1:' + conf.port + '/');

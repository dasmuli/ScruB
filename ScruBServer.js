var express = require('express')
,   app = express()
,   server = require('http').createServer(app)
,   io = require('socket.io').listen(server)
,   combo = require('combohandler')
,   conf = require('./config.json')
,   scrumDB = require( './ScrumDB.js' );

var root = '/public';

server.listen(conf.port);

app.use( express.compress() );

app.use( express.errorHandler() );

// Given a root path that points to a YUI 3 root folder, this route will
// handle URLs like:
//
// http://example.com/yui3?build/yui/yui-min.js&build/loader/loader-min.js
//
app.get('/combohandler', combo.combine({rootPath: __dirname + root }), combo.respond);

// serve public folder's contents
app.use(express.static(__dirname + root ));


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

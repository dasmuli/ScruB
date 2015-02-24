var express = require('express')
,   app = express()
,   server = require('http').createServer(app)
,   io = require('socket.io').listen(server)
,   conf = require('./config.json')
,   scrumDB = require( './ScrumDB.js' );

server.listen(conf.port);

// serve public folder's contents
app.use(express.static(__dirname + '/public'));


// show index.html on '/'
app.get('/', function (req, res) {
	res.sendfile(__dirname + '/public/index.html');
});


//////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////  Load scripts + data  ////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

// load scrumdata.js
var fs = require('fs');
eval( fs.readFileSync('public/scrumdata.js')+'' );

// init test data
scrumDataManager.InitTestData();


//////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////  websocket + events  ////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

io.sockets.on('connection', function (socket) {
	socket.emit('chat', { zeit: new Date(), text: 'You are locked on to the server!' });
	socket.on('chat', function (data) {
		io.sockets.emit('chat', { zeit: new Date(), name: data.name || 'Anonym', text: data.text });
	});
	
	socket.on('updateScrumData', function (data) {
		console.log( 'updateScrumData:' + data.id + ', name: ' + data.featurename );
		scrumDataArray[ data.id ].featurename = data.featurename;
		io.sockets.emit('scrubdata', {
			featurename:			scrumDataArray[ data.id ].featurename,
			id: 					scrumDataArray[ data.id ].id,
			complexity: 			scrumDataArray[ data.id ].complexity,
			priority: 				scrumDataArray[ data.id ].priority,
			previousPriorityId: 	scrumDataArray[ data.id ].previousPriorityId
			});
	});
	
	socket.on('moveDataUp', function (data) {
		console.log( 'moveDataUp:' + data.id );
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

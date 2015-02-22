var express = require('express')
,   app = express()
,   server = require('http').createServer(app)
,   io = require('socket.io').listen(server)
,   conf = require('./config.json');

// Webserver
// auf den Port x schalten
server.listen(conf.port);

// statische Dateien ausliefern
app.use(express.static(__dirname + '/public'));


// wenn der Pfad / aufgerufen wird
app.get('/', function (req, res) {
	// so wird die Datei index.html ausgegeben
	res.sendfile(__dirname + '/public/index.html');
});

// load scrumdata.js
var fs = require('fs');
eval( fs.readFileSync('public/scrumdata.js')+'' );

// Test data
scrumDataManager.InitTestData();

// Websocket
io.sockets.on('connection', function (socket) {
	// der Client ist verbunden
	socket.emit('chat', { zeit: new Date(), text: 'Du bist nun mit dem Server verbunden!' });
	// wenn ein Benutzer einen Text senden
	socket.on('chat', function (data) {
		// so wird dieser Text an alle anderen Benutzer gesendet
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

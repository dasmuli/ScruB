module.exports = function( options ) {
    this.server = options;
}

module.exports.listen = function( server )
{

this.fs = require('fs');
this.io = require('socket.io').listen( server );
this.scrumDB = require( './ScrumDB.js' );

// load the data manager with eval, reason: used in clients html,
// who can't require it. So it must be "eval"ed.
eval( this.fs.readFileSync('public/ScrumDataManager.js')+'' );
this.scrumDataManager = scrumDataManager;

// connect scrumDataManager to scrumDB
this.loadedData = this.scrumDB.LoadScrumDataSync( "Default" );
this.scrumDataManager.scrumDataArray  = this.loadedData.scrumDataArray;
this.scrumDataManager.priorityStartId = this.loadedData.priorityStartId;
this.scrumDataManager.lastFinishedId  = this.loadedData.lastFinishedId;
this.scrumDB.AddDataManager( this.scrumDataManager );
this.scrumDB.scrumDataArray = this.scrumDataManager.scrumDataArray;

//////////////////////////  Methods  //////////////////////////

this.ReceiveAddData = function( data ){
    this.scrumDataManager.AddDataToFront( data );
    this.io.sockets.emit( this.scrumDataManager.commandToClient.ADD_DATA_TO_FRONT, data );
}

///////////////  websocket + events  //////////////////////////

_scrumServer = this;  // global instance for callbacks, could not find better way :(

_scrumServer.io.sockets.on('connection', function (socket) {
	socket.emit('chat', { zeit: new Date(), text: 'You are locked on to the server!' });
	socket.on('chat', function (data) {
		_scrumServer.io.sockets.emit('chat', { zeit: new Date(), name: data.name || 'Anonym', text: data.text });
	});
	
	socket.on('updateScrumData', function (data) {
		_scrumServer.scrumDataManager.UpdateData( data );
		_scrumServer.io.sockets.emit('scrubdata', {
			featurename:		
				_scrumServer.scrumDataManager.scrumDataArray[ data.id ].featurename,
			id: 			
				_scrumServer.scrumDataManager.scrumDataArray[ data.id ].id,
			complexity: 		
				_scrumServer.scrumDataManager.scrumDataArray[ data.id ].complexity,
			priority: 		
				_scrumServer.scrumDataManager.scrumDataArray[ data.id ].priority,
			previousPriorityId: 	
				_scrumServer.scrumDataManager.scrumDataArray[ data.id ].previousPriorityId
			});
	});
    
    socket.on( _scrumServer.scrumDataManager.commandToServer.FINISH, function (data) {
		_scrumServer.scrumDataManager.UpdateData( data );
		if( _scrumServer.scrumDataManager.Finish( data.id ) )
        {
		    _scrumServer.io.sockets.emit( _scrumServer.scrumDataManager.commandToClient.FINISH,
                _scrumServer.scrumDataManager.scrumDataArray[ data.id ]
			);
        }
	});

	
	socket.on('moveDataUp', function (data) {
		if( _scrumServer.scrumDataManager.MovePriorityUp( data.id ) )
		{
		  _scrumServer.io.sockets.emit( 'scrubmoveup', data.id );
		}
	});
    
    socket.on( _scrumServer.scrumDataManager.commandToServer.ADD_DATA_TO_FRONT, function ( data )
    {
        _scrumServer.ReceiveAddData( data );
	});

	
	// Send complete array data to client
    console.log( "Sending laat finished id: " + _scrumServer.scrumDataManager.lastFinishedId );
	socket.emit('scrubfulldata', {
		dataArray:	        _scrumServer.scrumDataManager.scrumDataArray,
		priorityStartId:	_scrumServer.scrumDataManager.priorityStartId,
		lastFinishedId:	    _scrumServer.scrumDataManager.lastFinishedId,
	} );
});

} // listen

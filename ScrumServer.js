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
    ScruBs.emit( this.scrumDataManager.commandToClient.ADD_DATA_TO_FRONT, data );
}

///////////////  websocket + events  //////////////////////////

_scrumServer = this;  // global instance for callbacks, could not find better way :(

var ScruBs =_scrumServer.io.of( '/ScruB' ).on('connection', function (socket) {
	//socket.emit('chat', { zeit: new Date(), text: 'You are locked on to the server!' });
	//socket.on('chat', function (data) {
	//	_scrumServer.io.sockets.emit('chat', { zeit: new Date(), name: data.name || 'Anonym', text: data.text });
	//});
	
	socket.on( _scrumServer.scrumDataManager.commandToServer.UPDATE_DATA, function (data) {
		_scrumServer.scrumDataManager.UpdateData( data );
		ScruBs.emit(_scrumServer.scrumDataManager.commandToClient.UPDATE_DATA,
             _scrumServer.scrumDataManager.scrumDataArray[ data.id ]
            );
	});
    
    socket.on( _scrumServer.scrumDataManager.commandToServer.FINISH, function (data) {
		_scrumServer.scrumDataManager.UpdateData( data );
		if( _scrumServer.scrumDataManager.SetDoneState( data.id, true ) )
        {
		    ScruBs.emit( _scrumServer.scrumDataManager.commandToClient.FINISH,
                _scrumServer.scrumDataManager.scrumDataArray[ data.id ]
			);
        }
	});
    
    socket.on( _scrumServer.scrumDataManager.commandToServer.REOPEN, function (data) {
		_scrumServer.scrumDataManager.UpdateData( data );
		if( _scrumServer.scrumDataManager.SetDoneState( data.id, false ) )
        {
		    ScruBs.emit( _scrumServer.scrumDataManager.commandToClient.REOPEN,
                _scrumServer.scrumDataManager.scrumDataArray[ data.id ]
			);
        }
	});

	
	socket.on('moveDataUp', function (data) {
		if( _scrumServer.scrumDataManager.MovePriorityUp( data.id ) )
		{
		  ScruBs.emit( 'scrubmoveup', data.id );
		}
	});
    
    socket.on( _scrumServer.scrumDataManager.commandToServer.ADD_DATA_TO_FRONT, function ( data )
    {
        _scrumServer.ReceiveAddData( data );
	});

	
	// Send complete array data to client
	socket.emit('scrubfulldata', {
		dataArray:	        _scrumServer.scrumDataManager.scrumDataArray,
		priorityStartId:	_scrumServer.scrumDataManager.priorityStartId,
		lastFinishedId:	    _scrumServer.scrumDataManager.lastFinishedId,
	} );
});

} // listen

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
    // Ok, should be requirejs something something
    eval( this.fs.readFileSync('public/ScrumDataManager.js')+'' );
    this.scrumDataManager = scrumDataManager;

    // connect scrumDataManager to scrumDB
    this.loadedData = this.scrumDB.LoadScrumDataSync( "Default" );
    this.scrumDataManager.activeDataSet  = this.loadedData;
    this.scrumDB.AddDataSet( this.scrumDataManager.activeDataSet );

    //////////////////////////  Methods  //////////////////////////

    this.GetRandomId = function(){
        var result = "";
        var possible="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$-_.+!*(),";
        for( var i = 0; i < 5; i++ )
        {
            result += possible.charAt( Math.floor( Math.random() * possible.length ) );
        }
        return result;
    }

    this.CreateNewProject = function( name ){
       var newDataSet = new this.scrumDataManager.DataSet( name );
       return this.scrumDB.AddDataSet( newDataSet );
       //ScruBs.emit( this.scrumDataManager.commandToClient.ADD_DATA_TO_FRONT, data );
    }
    ///////////////  websocket + events  //////////////////////////

    _scrumServer = this;  // global instance for callbacks, could not find better way :(

    var ScruBs =_scrumServer.io.of( '/ScruB' ).on('connection', function (socket) {
	    //socket.emit('chat', { zeit: new Date(), text: 'You are locked on to the server!' });
	    //socket.on('chat', function (data) {
	    //	_scrumServer.io.sockets.emit('chat', { zeit: new Date(),
        //	   name: data.name || 'Anonym', text: data.text });
	   //});
        //console.log( "Socket wants to open: " + socket.handshake.query.db );

        socket.room = 'Default';
        socket.join( 'Default' );
	
	    socket.on( _scrumServer.scrumDataManager.commandToServer.UPDATE_DATA, function (data) {
		    _scrumServer.scrumDataManager.UpdateData( data );
		    ScruBs.in( socket.room )
                .emit(_scrumServer.scrumDataManager.commandToClient.UPDATE_DATA,
                  _scrumServer.scrumDataManager.activeDataSet.scrumDataArray[ data.id ]
                 );
	    });
    
        socket.on( _scrumServer.scrumDataManager.commandToServer.FINISH, function (data) {
		    _scrumServer.scrumDataManager.UpdateData( data );
		    if( _scrumServer.scrumDataManager.SetDoneState( data.id, true ) )
            {
		        ScruBs.in( socket.room ).emit( _scrumServer.scrumDataManager.commandToClient.FINISH,
                    _scrumServer.scrumDataManager.activeDataSet.scrumDataArray[ data.id ]
			    );
            }
	    });
    
        socket.on( _scrumServer.scrumDataManager.commandToServer.REOPEN, function (data) {
		    _scrumServer.scrumDataManager.UpdateData( data );
		    if( _scrumServer.scrumDataManager.SetDoneState( data.id, false ) )
            {
		        ScruBs.in( socket.room ).emit( _scrumServer.scrumDataManager.commandToClient.REOPEN,
                    _scrumServer.scrumDataManager.activeDataSet.scrumDataArray[ data.id ]
			    );
            }
	    });

	
	    socket.on('moveDataUp', function (data) {
		    if( _scrumServer.scrumDataManager.MovePriorityUp( data.id ) )
		    {
		       ScruBs.in( socket.room ).emit( 'scrubmoveup', data.id );
		    }
	    });
    
       socket.on( _scrumServer.scrumDataManager.commandToServer.ADD_DATA_TO_FRONT, function ( data )
       {
           _scrumServer.scrumDataManager.AddDataToFront( data );
           ScruBs.in( socket.room ).emit( _scrumServer.scrumDataManager.commandToClient.ADD_DATA_TO_FRONT, data );
	   });

       socket.on( _scrumServer.scrumDataManager.commandToServer.CREATE_ANONYMOUS_PROJECT, function ( data )
       {
           var newId = _scrumServer.GetRandomId();
           if(_scrumServer.CreateNewProject( newId ) )
           {
             //socket.leave( socket.room );
             //socket.join( newId );
             //socket.room = newId;
             socket.emit( _scrumServer.scrumDataManager.commandToClient.NEW_PROJECT_CREATED, {
     		   newId:	    newId,
	         } );
           }
	   });

	
	   // Send complete array data to client
	   socket.emit('scrubfulldata', {
		   dataArray:	    _scrumServer.scrumDataManager.activeDataSet.scrumDataArray,
		   priorityStartId:	_scrumServer.scrumDataManager.activeDataSet.priorityStartId,
		   lastFinishedId:	_scrumServer.scrumDataManager.activeDataSet.lastFinishedId,
	   } );
   });

} // listen

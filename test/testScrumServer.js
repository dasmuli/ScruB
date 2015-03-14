var assert      = require("assert")
var fs          = require( 'fs');
var vm          = require( 'vm');
var express     = require( 'express');
var app         = express();
var server      = require( 'http' ).Server( app );
var io          = require( 'socket.io-client');
var expect      = require( 'expect');
var scrumServer = require( '../ScrumServer.js' ).listen( server );

_scrumServer.scrumDataManager.InitTestData();
_scrumServer.scrumDataManager.name = "TestServer";

server.listen( 3001, function() {

describe( 'ScrumServer', function() {

    var socket;
    var testData;
    var dataReceivedCallback;
    var socketURL = 'http://127.0.0.1:3001/ScruB'
    var socketOptions = {
        transports: ['websocket'],
        'force new connection': true
    }

    beforeEach(function(done) {
        // Setup
	socket = io.connect( socketURL, {
	                     'reconnection delay' : 0
	                   , 'reopen delay' : 0
	                   , 'force new connection' : true
	});
	socket.on('connect', function() {
		           done();
	});
	socket.on('disconnect', function() {
	})
	
	socket.on( _scrumServer.scrumDataManager.commandToClient.ADD_DATA_TO_FRONT, function( _addedData ) {
		addedData = _addedData;
		dataReceivedCallback( _addedData );
	})
    });

    afterEach(function(done) {
        // Cleanup
	if( socket != undefined && socket.connected ) {
	    socket.disconnect();
	} else {
	    // There will not be a connection unless you have done() in beforeEach, socket.on('connect'...)
	}
	done();
    });

it('should accept a client connection', function () {
	  // connect is in beforeEach, disconnect in afterEach
	  assert.equal( 1, 1 );
});

it('should get some data on connect', function () {
	  assert.notEqual( _scrumServer, null );
	  assert.notEqual( _scrumServer.scrumDataManager, null );
	  assert.notEqual( _scrumServer.scrumDataManager.activeDataSet.scrumDataArray, null );
	  assert.equal( _scrumServer.scrumDataManager.activeDataSet.scrumDataArray.length, 3 );
	  assert.equal( _scrumServer.scrumDataManager.activeDataSet.priorityStartId, 0 );
});

it('should add and broadcast added data', function( done ) {
	  testData = new _scrumServer.scrumDataManager.DataObject();
      var receiveCallback = function( _addedData )
      {
	      assert.equal( JSON.stringify( _addedData), JSON.stringify( testData ) );
          done();
      }
	  dataReceivedCallback = receiveCallback;
	  assert.notEqual( testData, null );
	  _scrumServer.ReceiveAddData( testData );
	  assert.equal( _scrumServer.scrumDataManager.activeDataSet.scrumDataArray.length, 4 );
	  // new first element
	  assert.equal( _scrumServer.scrumDataManager.activeDataSet.scrumDataArray[ 3 ].previousPriorityId, -1 );
	  // added at front, so new start id for new element
	  assert.equal( _scrumServer.scrumDataManager.activeDataSet.priorityStartId, 3 );
});

it('should receive add commands', function( _dataReceivedCallback ) {
	  testData = new _scrumServer.scrumDataManager.DataObject();
      var callbackOnReceive = function()
      {
        //_scrumServer.ReceiveAddData( testData );
	    assert.equal( _scrumServer.scrumDataManager.activeDataSet.scrumDataArray.length, 5 );
	    // new first element
	    assert.equal( _scrumServer.scrumDataManager.activeDataSet.scrumDataArray[ 4 ].featurename, 'TestSendData' );
	    // added at front, so new start id for new element
	    assert.equal( _scrumServer.scrumDataManager.activeDataSet.priorityStartId, 4);
        _dataReceivedCallback();
      }
      testData.featurename = "TestSendData";
      testData.complexity  = 40;
	  dataReceivedCallback = callbackOnReceive;
      socket.emit( _scrumServer.scrumDataManager.commandToServer.ADD_DATA_TO_FRONT, testData );
});


} ); // of describe

}); // callback from listen

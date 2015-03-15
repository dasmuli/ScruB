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
    var adddataReceivedCallback = function() {};
    var fulldataReceivedCallback = function() {};
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
		adddataReceivedCallback( _addedData );
	})

    socket.on( _scrumServer.scrumDataManager.commandToClient.FULL_DATA, function( data ) {
		fulldataReceivedCallback( data );
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

    var ResetCallbacks = function()
    {
        adddataReceivedCallback = function() {};
        fulldataReceivedCallback = function() {};
    }

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
          ResetCallbacks();
	      assert.equal( JSON.stringify( _addedData), JSON.stringify( testData ) );
          done();
      }
	  adddataReceivedCallback = receiveCallback;
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
        ResetCallbacks();
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
	  adddataReceivedCallback = callbackOnReceive; // switch client callback
      socket.emit( _scrumServer.scrumDataManager.commandToServer.ADD_DATA_TO_FRONT, testData );
});

it('should generate a 5 char random string', function() {
	  var testString = _scrumServer.GetRandomId();
	  assert.equal( testString.length, 5 );
});

it('should receive create anonymous project command', function( _dataReceivedCallback ) {
	  testData = new _scrumServer.scrumDataManager.DataObject();
      var callbackOnReceive = function() // callback for complete data
      {
        ResetCallbacks();
        // newly generated name is set
        // flag for new project is set
        // new data set: 1 open and 2 done point: each +1 week in the future
	    //assert.equal( _scrumServer.scrumDataManager.activeDataSet.scrumDataArray.length, 5 );
        _dataReceivedCallback();
      }
	  fulldataReceivedCallback = callbackOnReceive; // switch client callback
      socket.emit( _scrumServer.scrumDataManager.commandToServer.CREATE_ANONYMOUS_PROJECT, {} );
});



} ); // of describe

}); // callback from listen

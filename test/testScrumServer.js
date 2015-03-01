var assert      = require("assert")
var fs          = require( 'fs');
var vm          = require( 'vm');
var express     = require( 'express');
var app         = express();
var server      = require( 'http' ).Server( app );
var io          = require( 'socket.io-client');
var expect      = require( 'expect');
var scrumServer = require( '../ScrumServer.js' ).listen( server );

server.listen( 3001, function() {

describe( 'ScrumServer', function() {

    var socket;
    var socketURL = 'http://127.0.0.1:3001'
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
	
	//done(); // done must be called to continue
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

it('should be running if mocha is installed', function () {
	  assert.equal( 1, 1 );
});

it('should accept a client connection', function () {
	  assert.equal( 1, 1 );
});

} ); // of describe

}); // callback from listen

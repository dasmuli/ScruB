
var assert = require("assert")
var fs = require( 'fs');
var vm = require( 'vm');
var expect = require( 'expect');
var scrumDB = require( '../ScrumDB.js' );

// load scrumdata.js
var scrumdataFile = fs.readFileSync('public/ScrumDataManager.js');
vm.runInThisContext( scrumdataFile );


describe( 'ScrumDB', function() {

it('should be running if mocha is installed', function () {
	  assert.equal( 1, 1 );
});

it('should exist a scrumDB', function () {
	  assert.notEqual( scrumDB, null );
	  assert.notEqual( scrumDB.LoadScrumDataSync, null );
});

it('should automatically load the Default', function () {
	  assert.notEqual( scrumDB.datasets[ 'Default' ], null );
});

it('should find the default data set', function () {
      var db = scrumDB.GetData( "Default" );
	  assert.notEqual( db, null );
	  assert.equal( db.name, "Default" );
});


it('should generate a file in the data directory', function ( done ) {
	  assert.notEqual( scrumDataManager.scrumDataArray, null );
	  assert.notEqual( scrumDataManager, null );
	  scrumDataManager.InitTestData();
	  scrumDB.SaveScrumDataAsync( "Test",
			 scrumDataManager.scrumDataArray,
			 scrumDataManager.priorityStartId,
             -1,
			 done );
});

it('should load the file in the data directory', function () {
	  scrumDataArray = null;
	  assert.equal( scrumDataArray, null );
	  assert.notEqual( scrumDataManager, null );
	  scrumDataManager.priorityStartId = -1;
	  var data = scrumDB.LoadScrumDataSync( "Test" );
	  scrumDataManager.priorityStartId = data.priorityStartId;
	  scrumDataArray = data.scrumDataArray;
	  assert.equal( scrumDataArray[ 2 ].id, 2 );
	  assert.equal( scrumDataManager.priorityStartId, 0 );
});

it('should have a timer', function () {
	  assert.notEqual( scrumDB.timerHandle, null );
});

it('should receive a scrum data manager an ask if it is changed', function (done) {
	  scrumDataManager.InitTestData();
	  var mockWasCalled = false;
	  scrumDataManager.IsDirty = function() {
		mockWasCalled = true;
		done();
	  }
	  scrumDB.AddDataManager( scrumDataManager );
});

it('should return something legal when loading non existing files', function () {
	  scrumDataArray = null;
	  assert.equal( scrumDataArray, null );
	  assert.notEqual( scrumDataManager, null );
	  scrumDataManager.priorityStartId = -1;
	  var data = scrumDB.LoadScrumDataSync( "NonExisting" );
	  assert.equal( data.scrumDataArray.length, 0 );
	  assert.equal( data.priorityStartId, -1 );
	  assert.equal( data.lastFinishedId, -1 );
});

it('should find the default data set', function () {
      var db = scrumDB.GetData( "Default" );
	  assert.notEqual( db, null );
	  assert.equal( db.name, "Default" );
});



} ); // of describe

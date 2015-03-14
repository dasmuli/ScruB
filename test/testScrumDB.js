
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


it('should generate a file in the data directory', function ( done ) {
	  assert.notEqual( scrumDataManager.scrumDataArray, null );
	  assert.notEqual( scrumDataManager, null );
	  scrumDataManager.InitTestData();
	  scrumDB.SaveScrumDataAsync( "Test2",
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

it('should receive a scrum data manager', function () {
	  scrumDataManager.InitTestData();
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

it('should create new project', function() {
	  var successResult =  _scrumServer.CreateNewProject( "TestCreateNewProject" );
      // check if project was added to scrumDB 
	  assert.equal( successResult, true );
      // if the project exists, the command is rejected
      successResult =  _scrumServer.CreateNewProject( "TestCreateNewProject" );
	  assert.equal( successResult, false );
      // remove from ScrumDB
      scrumDB.DeleteData( "TestCreateNewProject" );
});



} ); // of describe

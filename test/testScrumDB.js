
var assert = require("assert")
var fs = require( 'fs');
var vm = require( 'vm');
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

it('should generate a file in the data directory', function ( done ) {
	  assert.notEqual( scrumDataArray, null );
	  assert.notEqual( scrumDataManager, null );
	  scrumDataManager.InitTestData();
	  scrumDB.SaveScrumDataAsync( "Test",
			 scrumDataArray,
			 scrumDataManager.priorityStartId,
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

it('should automatically add missing elements while loading', function () {
	  scrumDataArray = null;
	  assert.equal( scrumDataArray, null );
	  // create empty array
	  var testArray = new Array();
	  var emptyObject = {};
	  testArray.push( emptyObject );
	  testArray.push( emptyObject );
	  var data = {
            scrumDataArray: testArray
	  };
	  // and save it
          fs.writeFileSync( "data/TestEmptyArray.json",
			JSON.stringify( data, null, ' ' ) ); 
	  data = scrumDB.LoadScrumDataSync( "TestEmptyArray" );
	  console.log( "Obj:" + JSON.stringify( data, null, ' ' ) );
	  assert.equal( data['priorityStartId'], -1 );
	  assert.equal( data.lastFinishedId, -1 );
	  scrumDataArray = data.scrumDataArray;
	  assert.equal( scrumDataArray[ 0 ].id, 0 );
	  assert.equal( scrumDataArray[ 0 ].featurename, "Unknown" );
	  assert.equal( scrumDataArray[ 0 ].complexity, 0 );
	  assert.equal( scrumDataArray[ 0 ].isFinished, false );
	  assert.equal( scrumDataArray[ 0 ].nextPriorityId, 1 );
	  assert.equal( scrumDataArray[ 0 ].previousPriorityId, -1 );
	  assert.equal( scrumDataArray[ 1 ].id, 1 );
	  assert.equal( scrumDataArray[ 1 ].featurename, "Unknown" );
	  assert.equal( scrumDataArray[ 1 ].complexity, 0 );
	  assert.equal( scrumDataArray[ 1 ].isFinished, false );
	  assert.equal( scrumDataArray[ 1 ].nextPriorityId, 1 );
	  assert.equal( scrumDataArray[ 1 ].previousPriorityId, -1 );

});


} );

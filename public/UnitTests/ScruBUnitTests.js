
QUnit.test( "qunit test", function( assert ) {
	assert.ok( 1 == "1", "Passed!" );
});

QUnit.test( "scrum data test array exists", function( assert ) {
	assert.notEqual( scrumDataArray, null );
});

QUnit.test( "scrum data init testdata", function( assert ) {
	scrumDataManager.InitTestData();
	assert.ok( scrumDataArray.length == 3 );
});

QUnit.test( "scrum data check integrity", function( assert ) {
	scrumDataManager.InitTestData();
	assert.equal( scrumDataManager.IsIntegrityOk(), true );
	assert.equal( scrumDataManager.PriorityListLength(), 3 );
	scrumDataArray[ 0 ].previousPriorityId = 1;
	assert.equal( scrumDataManager.IsIntegrityOk(), false );
	scrumDataArray[ 0 ].previousPriorityId = -1;
	assert.equal( scrumDataManager.IsIntegrityOk(), true );
	scrumDataArray[ 2 ].nextPriorityId = 1;
	assert.equal( scrumDataManager.IsIntegrityOk(), false );
	scrumDataArray[ 2 ].nextPriorityId = -1;
});

QUnit.test( "scrum data check prio list length", function( assert ) {
	scrumDataManager.InitTestData();
	assert.equal( scrumDataManager.PriorityListLength(), 3 );
	scrumDataArray[ 1 ].nextPriorityId = -1;
	assert.equal( scrumDataManager.PriorityListLength(), 2 );
	scrumDataArray[ 0 ].nextPriorityId = -1;
	assert.equal( scrumDataManager.PriorityListLength(), 1 );
});

QUnit.test( "scrum data move up", function( assert ) {
	scrumDataManager.InitTestData();
	
	var result = scrumDataManager.MovePriorityUp( 0 );
	assert.equal( result, false );
	assert.equal( scrumDataManager.IsIntegrityOk(), true );
	assert.equal( scrumDataManager.PriorityListLength(), 3 );
	assert.equal( scrumDataManager.priorityStartId, 0 );  // nothing changed
	
	result = scrumDataManager.MovePriorityUp( 1 );
	assert.equal( result, true );
	assert.equal( scrumDataManager.IsIntegrityOk(), true );
	assert.equal( scrumDataManager.PriorityListLength(), 3 );
	assert.equal( scrumDataManager.priorityStartId, 1 );
	assert.equal( scrumDataArray[ 1 ].previousPriorityId, -1 );
	assert.equal( scrumDataArray[ 1 ].nextPriorityId, 0 );
	assert.equal( scrumDataArray[ 0 ].previousPriorityId, 1 );
	
	scrumDataManager.MovePriorityUp( 0 );
	assert.equal( scrumDataManager.IsIntegrityOk(), true );
	assert.equal( scrumDataManager.PriorityListLength(), 3 );
	assert.equal( scrumDataManager.priorityStartId, 0 );
	assert.equal( scrumDataArray[ 0 ].previousPriorityId, -1 );
	assert.equal( scrumDataArray[ 1 ].previousPriorityId, 0 );
	assert.equal( scrumDataArray[ 0 ].nextPriorityId, 1 );
	
	scrumDataManager.MovePriorityUp( 2 );
	assert.equal( scrumDataManager.IsIntegrityOk(), true );
	assert.equal( scrumDataManager.PriorityListLength(), 3 );
	assert.equal( scrumDataManager.priorityStartId, 0 );
	assert.equal( scrumDataArray[ 1 ].previousPriorityId, 2 );
	assert.equal( scrumDataArray[ 1 ].nextPriorityId, -1 );
	assert.equal( scrumDataArray[ 2 ].previousPriorityId, 0 );
	assert.equal( scrumDataArray[ 2 ].nextPriorityId, 1 );
	assert.equal( scrumDataArray[ 0 ].nextPriorityId, 2 );
});

QUnit.test( "scrum data dirty dirty flag", function( assert ) {
	scrumDataManager.InitTestData();
	assert.equal( scrumDataManager.dirtyFlag, false );
	assert.equal( scrumDataManager.IsDirty(), false );
	assert.equal( scrumDataManager.versionCounter, 0 );

	var testData = new scrumDataManager.DataObject( 2 );
	scrumDataManager.UpdateData( testData );
	assert.equal( scrumDataManager.dirtyFlag, true );
	assert.equal( scrumDataManager.IsDirty(), true );
	assert.equal( scrumDataManager.versionCounter, 1 );
	scrumDataManager.dirtyFlag = false;
	
	// first element not moved -> not dirty
	scrumDataManager.MovePriorityUp( 0 );
	assert.equal( scrumDataManager.dirtyFlag, false );
	assert.equal( scrumDataManager.IsDirty(), false );
	assert.equal( scrumDataManager.versionCounter, 1 );

	scrumDataManager.MovePriorityUp( 1 );
	assert.equal( scrumDataManager.dirtyFlag, true );
	assert.equal( scrumDataManager.IsDirty(), true );
	assert.equal( scrumDataManager.versionCounter, 2 );

});

QUnit.test( "scrum update only informational data, not structure", function( assert ) {
	scrumDataManager.InitTestData();
	assert.equal( scrumDataArray[ 0 ].nextPriorityId, 1 );
	assert.equal( scrumDataArray[ 0 ].previousPriorityId, -1 );
	assert.equal( scrumDataArray[ 0 ].featurename, "TestData0" );
	assert.equal( scrumDataArray[ 0 ].priority, 0 );
	assert.equal( scrumDataArray[ 0 ].complexity, 2 );

	var testData = new scrumDataManager.DataObject( 0 );
	testData.featurename = "Changed";
	testData.priority = 3;
	testData.complexity = 8;
	testData.previousPriorityId = 99;
	testData.nextPriorityId = 99;

	scrumDataManager.UpdateData( testData );

	assert.equal( scrumDataArray[ 0 ].nextPriorityId, 1 );
	assert.equal( scrumDataArray[ 0 ].previousPriorityId, -1 );
	assert.equal( scrumDataArray[ 0 ].featurename, "Changed" );
	assert.equal( scrumDataArray[ 0 ].priority, 3 );
	assert.equal( scrumDataArray[ 0 ].complexity, 8 );
});


QUnit.test( "scrum data manager has a name", function( assert ) {
	scrumDataManager.InitTestData();
	assert.equal( scrumDataManager.name, "Default" );
});



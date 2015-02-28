
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

QUnit.test( "scrum data manager has initial empty finish list", function( assert ) {
	scrumDataManager.InitTestData();
	assert.equal( scrumDataManager.lastFinishedId, -1 );
});

QUnit.test( "scrum data manager initiates finish list on first finish", function( assert ) {
	scrumDataManager.InitTestData();
	assert.equal( scrumDataManager.dirtyFlag, false );
	assert.equal( scrumDataManager.IsDirty(), false );
	assert.equal( scrumDataArray[ 0 ].isFinished, false );
	var result = scrumDataManager.Finish( 0 );
	assert.equal( result, true );
	assert.equal( scrumDataManager.dirtyFlag, true );
	assert.equal( scrumDataManager.IsDirty(), true );
	assert.equal( scrumDataManager.lastFinishedId, 0 );
	assert.equal( scrumDataManager.priorityStartId, 1 );
	assert.equal( scrumDataArray[ 0 ].nextPriorityId, -1 );
	assert.equal( scrumDataArray[ 0 ].nextPriorityId, -1 );
	assert.equal( scrumDataArray[ 0 ].isFinished, true );
	assert.equal( scrumDataArray[ 1 ].nextPriorityId, 2 );
	assert.equal( scrumDataArray[ 1 ].previousPriorityId, -1 );
	// retry must be unsusccessull
	result = scrumDataManager.Finish( 0 );
	assert.equal( result, false );
});

QUnit.test( "scrum data manager finish on middle element", function( assert ) {
	scrumDataManager.InitTestData();
	assert.equal( scrumDataManager.dirtyFlag, false );
	assert.equal( scrumDataManager.IsDirty(), false );
	assert.equal( scrumDataArray[ 1 ].isFinished, false );
	var result = scrumDataManager.Finish( 1 );
	assert.equal( result, true );
	assert.equal( scrumDataManager.dirtyFlag, true );
	assert.equal( scrumDataManager.IsDirty(), true );
	assert.equal( scrumDataManager.lastFinishedId, 1 );
	assert.equal( scrumDataManager.priorityStartId, 0 );
	assert.equal( scrumDataArray[ 1 ].nextPriorityId, -1 );
	assert.equal( scrumDataArray[ 1 ].nextPriorityId, -1 );
	assert.equal( scrumDataArray[ 1 ].isFinished, true );
	assert.equal( scrumDataArray[ 0 ].nextPriorityId, 2 );
	assert.equal( scrumDataArray[ 0 ].previousPriorityId, -1 );
	// retry must be unsusccessull
	result = scrumDataManager.Finish( 1 );
	assert.equal( result, false );
});

QUnit.test( "scrum data manager finish last element", function( assert ) {
	scrumDataManager.InitTestData();
	assert.equal( scrumDataManager.dirtyFlag, false );
	assert.equal( scrumDataManager.IsDirty(), false );
	assert.equal( scrumDataArray[ 2 ].isFinished, false );
	var result = scrumDataManager.Finish( 2 );
	assert.equal( result, true );
	assert.equal( scrumDataManager.dirtyFlag, true );
	assert.equal( scrumDataManager.IsDirty(), true );
	assert.equal( scrumDataManager.lastFinishedId, 2 );
	assert.equal( scrumDataManager.priorityStartId, 0 );
	assert.equal( scrumDataArray[ 2 ].nextPriorityId, -1 );
	assert.equal( scrumDataArray[ 2 ].nextPriorityId, -1 );
	assert.equal( scrumDataArray[ 2 ].isFinished, true );
	assert.equal( scrumDataArray[ 1 ].nextPriorityId, -1 );
	assert.equal( scrumDataArray[ 1 ].previousPriorityId, 0 );
	// retry must be unsusccessull
	result = scrumDataManager.Finish( 2 );
	assert.equal( result, false );
});

QUnit.test( "scrum data manager finish 2", function( assert ) {
	scrumDataManager.InitTestData();
	var result = scrumDataManager.Finish( 1 );
	assert.equal( result, true );
	assert.equal( scrumDataManager.lastFinishedId, 1 );
	assert.equal( scrumDataManager.priorityStartId, 0 );
	// finish first element
	result = scrumDataManager.Finish( 0 );
	assert.equal( scrumDataManager.lastFinishedId, 0 );
	assert.equal( scrumDataManager.priorityStartId, 2 );
	assert.equal( scrumDataArray[ 0 ].nextPriorityId, 1 );
	assert.equal( scrumDataArray[ 1 ].previousPriorityId, 0 );
	assert.equal( scrumDataArray[ 0 ].isFinished, true );
	assert.equal( scrumDataArray[ 2 ].nextPriorityId, -1 );
	assert.equal( scrumDataArray[ 2 ].previousPriorityId, -1 );
	// retry must be unsusccessull
	result = scrumDataManager.Finish( 0 );
	assert.equal( result, false );
});

QUnit.test( "scrum data manager finish everything possible and adding therafter too", function( assert ) {
	scrumDataManager.InitTestData();
	var result = scrumDataManager.Finish( 0 );
	assert.equal( result, true );
	result = scrumDataManager.Finish( 1 );
	assert.equal( result, true );
	result = scrumDataManager.Finish( 2 );
	assert.equal( result, true );
	assert.equal( scrumDataManager.lastFinishedId, 2 );
	assert.equal( scrumDataManager.priorityStartId, -1 );
	assert.equal( scrumDataArray[ 2 ].nextPriorityId, 1 );
	assert.equal( scrumDataArray[ 2 ].previousPriorityId, -1 );
	assert.equal( scrumDataArray[ 1 ].nextPriorityId, 0 );
	assert.equal( scrumDataArray[ 1 ].previousPriorityId, 2 );
	assert.equal( scrumDataArray[ 0 ].nextPriorityId, -1 );
	assert.equal( scrumDataArray[ 0 ].previousPriorityId, 1 );

	// adding to an empty list must work
	result = scrumDataManager.Finish( 0 );
	assert.equal( result, false );
});

QUnit.test( "scrum data manager add new data at front", function( assert ) {
	scrumDataManager.InitTestData();
	var testData = new scrumDataManager.DataObject( 0 );
	testData.featurename = "Added";
	testData.priority = 3;
	testData.complexity = 18;
	testData.previousPriorityId = 99;
	testData.nextPriorityId = 99;
	assert.equal( scrumDataManager.IsDirty(), false );

	scrumDataManager.AddDataToFront( testData );

	assert.equal( scrumDataManager.IsDirty(), true );
	assert.equal( scrumDataManager.priorityStartId, 3 );
	assert.equal( scrumDataArray[ 0 ].nextPriorityId, 1 );
	assert.equal( scrumDataArray[ 0 ].previousPriorityId, 3 );
	assert.equal( scrumDataArray[ 3 ].nextPriorityId, 0 );
	assert.equal( scrumDataArray[ 3 ].previousPriorityId, -1 );
	assert.equal( scrumDataArray[ 3 ].featurename, "Added" );
	assert.equal( scrumDataArray[ 3 ].priority, 3 );
	assert.equal( scrumDataArray[ 3 ].complexity, 18 );

});


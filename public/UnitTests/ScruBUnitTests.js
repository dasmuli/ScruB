
QUnit.test( "qunit test", function( assert ) {
	assert.ok( 1 == "1", "Passed!" );
});

QUnit.test( "scrum data test array exists", function( assert ) {
	assert.notEqual( scrumDataManager.scrumDataArray, null );
});

QUnit.test( "scrum data init testdata", function( assert ) {
	scrumDataManager.InitTestData();
	assert.ok( scrumDataManager.scrumDataArray.length == 3 );
});

QUnit.test( "scrum data check integrity", function( assert ) {
	scrumDataManager.InitTestData();
	assert.equal( scrumDataManager.IsIntegrityOk(), true );
	assert.equal( scrumDataManager.PriorityListLength(), 3 );
	scrumDataManager.scrumDataArray[ 0 ].previousPriorityId = 1;
	assert.equal( scrumDataManager.IsIntegrityOk(), false );
	scrumDataManager.scrumDataArray[ 0 ].previousPriorityId = -1;
	assert.equal( scrumDataManager.IsIntegrityOk(), true );
	scrumDataManager.scrumDataArray[ 2 ].nextPriorityId = 1;
	assert.equal( scrumDataManager.IsIntegrityOk(), false );
	scrumDataManager.scrumDataArray[ 2 ].nextPriorityId = -1;
});

QUnit.test( "scrum data check prio list length", function( assert ) {
	scrumDataManager.InitTestData();
	assert.equal( scrumDataManager.PriorityListLength(), 3 );
	scrumDataManager.scrumDataArray[ 1 ].nextPriorityId = -1;
	assert.equal( scrumDataManager.PriorityListLength(), 2 );
	scrumDataManager.scrumDataArray[ 0 ].nextPriorityId = -1;
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
	assert.equal( scrumDataManager.scrumDataArray[ 1 ].previousPriorityId, -1 );
	assert.equal( scrumDataManager.scrumDataArray[ 1 ].nextPriorityId, 0 );
	assert.equal( scrumDataManager.scrumDataArray[ 0 ].previousPriorityId, 1 );
	
	scrumDataManager.MovePriorityUp( 0 );
	assert.equal( scrumDataManager.IsIntegrityOk(), true );
	assert.equal( scrumDataManager.PriorityListLength(), 3 );
	assert.equal( scrumDataManager.priorityStartId, 0 );
	assert.equal( scrumDataManager.scrumDataArray[ 0 ].previousPriorityId, -1 );
	assert.equal( scrumDataManager.scrumDataArray[ 1 ].previousPriorityId, 0 );
	assert.equal( scrumDataManager.scrumDataArray[ 0 ].nextPriorityId, 1 );
	
	scrumDataManager.MovePriorityUp( 2 );
	assert.equal( scrumDataManager.IsIntegrityOk(), true );
	assert.equal( scrumDataManager.PriorityListLength(), 3 );
	assert.equal( scrumDataManager.priorityStartId, 0 );
	assert.equal( scrumDataManager.scrumDataArray[ 1 ].previousPriorityId, 2 );
	assert.equal( scrumDataManager.scrumDataArray[ 1 ].nextPriorityId, -1 );
	assert.equal( scrumDataManager.scrumDataArray[ 2 ].previousPriorityId, 0 );
	assert.equal( scrumDataManager.scrumDataArray[ 2 ].nextPriorityId, 1 );
	assert.equal( scrumDataManager.scrumDataArray[ 0 ].nextPriorityId, 2 );
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
	assert.equal( scrumDataManager.scrumDataArray[ 0 ].nextPriorityId, 1 );
	assert.equal( scrumDataManager.scrumDataArray[ 0 ].previousPriorityId, -1 );
	assert.equal( scrumDataManager.scrumDataArray[ 0 ].featurename, "TestData0" );
	assert.equal( scrumDataManager.scrumDataArray[ 0 ].priority, 0 );
	assert.equal( scrumDataManager.scrumDataArray[ 0 ].complexity, 2 );

	var testData = new scrumDataManager.DataObject( 0 );
	testData.featurename = "Changed";
	testData.priority = 3;
	testData.complexity = 8;
	testData.previousPriorityId = 99;
	testData.nextPriorityId = 99;

	scrumDataManager.UpdateData( testData );

	assert.equal( scrumDataManager.scrumDataArray[ 0 ].nextPriorityId, 1 );
	assert.equal( scrumDataManager.scrumDataArray[ 0 ].previousPriorityId, -1 );
	assert.equal( scrumDataManager.scrumDataArray[ 0 ].featurename, "Changed" );
	assert.equal( scrumDataManager.scrumDataArray[ 0 ].complexity, 8 );
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
	assert.equal( scrumDataManager.scrumDataArray[ 0 ].isFinished, false );
	var result = scrumDataManager.SetDoneState( 0, true );
	assert.equal( result, true );
	assert.equal( scrumDataManager.dirtyFlag, true );
	assert.equal( scrumDataManager.IsDirty(), true );
	assert.equal( scrumDataManager.lastFinishedId, 0 );
	assert.equal( scrumDataManager.priorityStartId, 1 );
	assert.equal( scrumDataManager.scrumDataArray[ 0 ].nextPriorityId, -1 );
	assert.equal( scrumDataManager.scrumDataArray[ 0 ].nextPriorityId, -1 );
	assert.equal( scrumDataManager.scrumDataArray[ 0 ].isFinished, true );
	assert.equal( scrumDataManager.scrumDataArray[ 1 ].nextPriorityId, 2 );
	assert.equal( scrumDataManager.scrumDataArray[ 1 ].previousPriorityId, -1 );
	// retry must be unsusccessull
	result = scrumDataManager.SetDoneState( 0, true );
	assert.equal( result, false );
});

QUnit.test( "scrum data manager finish on middle element", function( assert ) {
	scrumDataManager.InitTestData();
	assert.equal( scrumDataManager.dirtyFlag, false );
	assert.equal( scrumDataManager.IsDirty(), false );
	assert.equal( scrumDataManager.scrumDataArray[ 1 ].isFinished, false );
	var result = scrumDataManager.SetDoneState( 1, true );
	assert.equal( result, true );
	assert.equal( scrumDataManager.dirtyFlag, true );
	assert.equal( scrumDataManager.IsDirty(), true );
	assert.equal( scrumDataManager.lastFinishedId, 1 );
	assert.equal( scrumDataManager.priorityStartId, 0 );
	assert.equal( scrumDataManager.scrumDataArray[ 1 ].nextPriorityId, -1 );
	assert.equal( scrumDataManager.scrumDataArray[ 1 ].nextPriorityId, -1 );
	assert.equal( scrumDataManager.scrumDataArray[ 1 ].isFinished, true );
	assert.equal( scrumDataManager.scrumDataArray[ 0 ].nextPriorityId, 2 );
	assert.equal( scrumDataManager.scrumDataArray[ 0 ].previousPriorityId, -1 );
	// retry must be unsusccessull
	result = scrumDataManager.SetDoneState( 1, true );
	assert.equal( result, false );
});

QUnit.test( "scrum data manager finish last element", function( assert ) {
	scrumDataManager.InitTestData();
	assert.equal( scrumDataManager.dirtyFlag, false );
	assert.equal( scrumDataManager.IsDirty(), false );
	assert.equal( scrumDataManager.scrumDataArray[ 2 ].isFinished, false );
	var result = scrumDataManager.SetDoneState( 2, true );
	assert.equal( result, true );
	assert.equal( scrumDataManager.dirtyFlag, true );
	assert.equal( scrumDataManager.IsDirty(), true );
	assert.equal( scrumDataManager.lastFinishedId, 2 );
	assert.equal( scrumDataManager.priorityStartId, 0 );
	assert.equal( scrumDataManager.scrumDataArray[ 2 ].nextPriorityId, -1 );
	assert.equal( scrumDataManager.scrumDataArray[ 2 ].nextPriorityId, -1 );
	assert.equal( scrumDataManager.scrumDataArray[ 2 ].isFinished, true );
	assert.equal( scrumDataManager.scrumDataArray[ 1 ].nextPriorityId, -1 );
	assert.equal( scrumDataManager.scrumDataArray[ 1 ].previousPriorityId, 0 );
	// retry must be unsusccessull
	result = scrumDataManager.SetDoneState( 2, true );
	assert.equal( result, false );
});

QUnit.test( "scrum data manager finish 2", function( assert ) {
	scrumDataManager.InitTestData();
	var result = scrumDataManager.SetDoneState( 1, true );
	assert.equal( result, true );
	assert.equal( scrumDataManager.lastFinishedId, 1 );
	assert.equal( scrumDataManager.priorityStartId, 0 );
	// finish first element
	result = scrumDataManager.SetDoneState( 0, true );
	assert.equal( scrumDataManager.lastFinishedId, 0 );
	assert.equal( scrumDataManager.priorityStartId, 2 );
	assert.equal( scrumDataManager.scrumDataArray[ 0 ].nextPriorityId, 1 );
	assert.equal( scrumDataManager.scrumDataArray[ 1 ].previousPriorityId, 0 );
	assert.equal( scrumDataManager.scrumDataArray[ 0 ].isFinished, true );
	assert.equal( scrumDataManager.scrumDataArray[ 2 ].nextPriorityId, -1 );
	assert.equal( scrumDataManager.scrumDataArray[ 2 ].previousPriorityId, -1 );
	// retry must be unsusccessull
	result = scrumDataManager.SetDoneState( 0, true );
	assert.equal( result, false );
});

QUnit.test( "scrum data manager finish everything possible and adding therafter too", function( assert ) {
	scrumDataManager.InitTestData();
	var result = scrumDataManager.SetDoneState( 0, true );
	assert.equal( result, true );
	result = scrumDataManager.SetDoneState( 1, true );
	assert.equal( result, true );
	result = scrumDataManager.SetDoneState( 2, true );
	assert.equal( result, true );
	assert.equal( scrumDataManager.lastFinishedId, 2 );
	assert.equal( scrumDataManager.priorityStartId, -1 );
	assert.equal( scrumDataManager.scrumDataArray[ 2 ].nextPriorityId, 1 );
	assert.equal( scrumDataManager.scrumDataArray[ 2 ].previousPriorityId, -1 );
	assert.equal( scrumDataManager.scrumDataArray[ 1 ].nextPriorityId, 0 );
	assert.equal( scrumDataManager.scrumDataArray[ 1 ].previousPriorityId, 2 );
	assert.equal( scrumDataManager.scrumDataArray[ 0 ].nextPriorityId, -1 );
	assert.equal( scrumDataManager.scrumDataArray[ 0 ].previousPriorityId, 1 );
	assert.notEqual( scrumDataManager.scrumDataArray[ 0 ].finishDate, undefined );
	assert.notEqual( scrumDataManager.scrumDataArray[ 1 ].finishDate, undefined );
	assert.notEqual( scrumDataManager.scrumDataArray[ 2 ].finishDate, undefined );

	// adding to an empty list must work
	result = scrumDataManager.SetDoneState( 0, true );
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
	assert.equal( scrumDataManager.scrumDataArray[ 0 ].nextPriorityId, 1 );
	assert.equal( scrumDataManager.scrumDataArray[ 0 ].previousPriorityId, 3 );
	assert.equal( scrumDataManager.scrumDataArray[ 3 ].nextPriorityId, 0 );
	assert.equal( scrumDataManager.scrumDataArray[ 3 ].previousPriorityId, -1 );
	assert.equal( scrumDataManager.scrumDataArray[ 3 ].featurename, "Added" );
	assert.equal( scrumDataManager.scrumDataArray[ 3 ].priority, 3 );
	assert.equal( scrumDataManager.scrumDataArray[ 3 ].complexity, 18 );

});

QUnit.test( "scrum data manager initiates reopen on first finished", function( assert ) {
	scrumDataManager.InitTestData();
	assert.equal( scrumDataManager.scrumDataArray[ 0 ].isFinished, false );
	var result = scrumDataManager.SetDoneState( 0, true );
	assert.equal( result, true );
    result = scrumDataManager.SetDoneState( 1, false );
	assert.equal( result, false );  // reopen on opened element fails
    result = scrumDataManager.SetDoneState( 0, false );
	assert.equal( result, true );
	assert.equal( scrumDataManager.lastFinishedId, -1 );
	assert.equal( scrumDataManager.priorityStartId, 0 );
	assert.equal( scrumDataManager.scrumDataArray[ 0 ].nextPriorityId, 1 );
	assert.equal( scrumDataManager.scrumDataArray[ 0 ].previousPriorityId, -1 );
	assert.equal( scrumDataManager.scrumDataArray[ 0 ].isFinished, false );
	assert.equal( scrumDataManager.scrumDataArray[ 1 ].nextPriorityId, 2 );
	assert.equal( scrumDataManager.scrumDataArray[ 1 ].previousPriorityId, 0 );
	// retry must be unsusccessull
	result = scrumDataManager.SetDoneState( 0, false );
	assert.equal( result, false );
});

QUnit.test( "scrum data manager reopen middle element", function( assert ) {
	scrumDataManager.InitTestData();
	assert.equal( scrumDataManager.dirtyFlag, false );
	assert.equal( scrumDataManager.IsDirty(), false );
	assert.equal( scrumDataManager.scrumDataArray[ 1 ].isFinished, false );
	var result = scrumDataManager.SetDoneState( 1, true );
	assert.equal( result, true );
    result = scrumDataManager.SetDoneState( 1, false );
	assert.equal( result, true );
	assert.equal( scrumDataManager.dirtyFlag, true );
	assert.equal( scrumDataManager.IsDirty(), true );
	assert.equal( scrumDataManager.lastFinishedId, -1 );
	assert.equal( scrumDataManager.priorityStartId, 1 );
	assert.equal( scrumDataManager.scrumDataArray[ 1 ].nextPriorityId, 0 );
	assert.equal( scrumDataManager.scrumDataArray[ 1 ].previousPriorityId, -1 );
	assert.equal( scrumDataManager.scrumDataArray[ 1 ].isFinished, false );
	assert.equal( scrumDataManager.scrumDataArray[ 0 ].nextPriorityId, 2 );
	assert.equal( scrumDataManager.scrumDataArray[ 0 ].previousPriorityId, 1 );
	// retry must be unsusccessull
	result = scrumDataManager.SetDoneState( 1, false );
	assert.equal( result, false );
});

QUnit.test( "scrum data manager reopen last element", function( assert ) {
	scrumDataManager.InitTestData();
	assert.equal( scrumDataManager.dirtyFlag, false );
	assert.equal( scrumDataManager.IsDirty(), false );
	assert.equal( scrumDataManager.scrumDataArray[ 2 ].isFinished, false );
	var result = scrumDataManager.SetDoneState( 2, true );
	assert.equal( result, true );
    result = scrumDataManager.SetDoneState( 2, false );
	assert.equal( result, true );
	assert.equal( scrumDataManager.dirtyFlag, true );
	assert.equal( scrumDataManager.IsDirty(), true );
	assert.equal( scrumDataManager.lastFinishedId, -1 );
	assert.equal( scrumDataManager.priorityStartId, 2 );
	assert.equal( scrumDataManager.scrumDataArray[ 2 ].nextPriorityId, 0 );
	assert.equal( scrumDataManager.scrumDataArray[ 2 ].previousPriorityId, -1 );
	assert.equal( scrumDataManager.scrumDataArray[ 2 ].isFinished, false );
	assert.equal( scrumDataManager.scrumDataArray[ 1 ].nextPriorityId, -1 );
	assert.equal( scrumDataManager.scrumDataArray[ 1 ].previousPriorityId, 0 );
	// retry must be unsusccessull
	result = scrumDataManager.SetDoneState( 2, false );
	assert.equal( result, false );
});

QUnit.test( "scrum data manager should return allways something",
    function( assert ) {
	scrumDataManager.InitTestData();
    scrumDataManager.scrumDataArray = new Array();
    var result = scrumDataManager.GetSumAndOldestDateOfFinished();
	assert.equal( result.sum, 0 );
	assert.notEqual( result.oldestDate, undefined );

});	
QUnit.test( "scrum data manager should compute sum and oldest date",
    function( assert ) {
	scrumDataManager.InitTestData();
    var oldest = new Date( 2003, 6, 1 );
    scrumDataManager.scrumDataArray[ 0 ].finishDate = new Date( 2003, 6, 8 );
    scrumDataManager.scrumDataArray[ 0 ].complexity = 40;
    scrumDataManager.scrumDataArray[ 0 ].isFinished = true;
    scrumDataManager.scrumDataArray[ 1 ].finishDate = oldest;
    scrumDataManager.scrumDataArray[ 1 ].complexity = 13;
    scrumDataManager.scrumDataArray[ 1 ].isFinished = true;
    scrumDataManager.scrumDataArray[ 2 ].finishDate = new Date( 2003, 6, 15 );
    scrumDataManager.scrumDataArray[ 2 ].complexity = 8;
    scrumDataManager.scrumDataArray[ 2 ].isFinished = false;
    var result = scrumDataManager.GetSumAndOldestDateOfFinished();
	assert.equal( result.sum, 53 );
	assert.equal( result.oldestDate, oldest );
});



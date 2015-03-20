
QUnit.test( "qunit test", function( assert ) {
	assert.ok( 1 == "1", "Passed!" );
});

QUnit.test( "scrum data test array exists", function( assert ) {
	assert.notEqual( scrumDataManager.activeDataSet.scrumDataArray, null );
});

QUnit.test( "scrum data manager has default, non empty data set.",
    function( assert ) {
	assert.notEqual( scrumDataManager.activeDataSet, undefined );
	assert.equal( scrumDataManager.activeDataSet.priorityStartId, -1 );
	assert.notEqual( scrumDataManager.activeDataSet.scrumDataArray, undefined );
	assert.equal( scrumDataManager.activeDataSet.lastFinishedId, -1 );
	assert.equal( scrumDataManager.activeDataSet.dirtyFlag, false );
	assert.equal( scrumDataManager.activeDataSet.name, "Default" );
	assert.equal( scrumDataManager.activeDataSet.versionCounter, 0 );
});

QUnit.test( "scrum data init testdata", function( assert ) {
	scrumDataManager.InitTestData();
	assert.ok( scrumDataManager.activeDataSet.scrumDataArray.length == 3 );
});

QUnit.test( "scrum data check integrity", function( assert ) {
	scrumDataManager.InitTestData();
	assert.equal( scrumDataManager.IsIntegrityOk(), true );
	assert.equal( scrumDataManager.PriorityListLength(), 3 );
	scrumDataManager.activeDataSet.scrumDataArray[ 0 ].previousPriorityId = 1;
	assert.equal( scrumDataManager.IsIntegrityOk(), false );
	scrumDataManager.activeDataSet.scrumDataArray[ 0 ].previousPriorityId = -1;
	assert.equal( scrumDataManager.IsIntegrityOk(), true );
	scrumDataManager.activeDataSet.scrumDataArray[ 2 ].nextPriorityId = 1;
	assert.equal( scrumDataManager.IsIntegrityOk(), false );
	scrumDataManager.activeDataSet.scrumDataArray[ 2 ].nextPriorityId = -1;
});

QUnit.test( "scrum data check prio list length", function( assert ) {
	scrumDataManager.InitTestData();
	assert.equal( scrumDataManager.PriorityListLength(), 3 );
	scrumDataManager.activeDataSet.scrumDataArray[ 1 ].nextPriorityId = -1;
	assert.equal( scrumDataManager.PriorityListLength(), 2 );
	scrumDataManager.activeDataSet.scrumDataArray[ 0 ].nextPriorityId = -1;
	assert.equal( scrumDataManager.PriorityListLength(), 1 );
});

QUnit.test( "scrum data move up", function( assert ) {
	scrumDataManager.InitTestData();
	
	var result = scrumDataManager.MovePriorityUp( 0 );
	assert.equal( result, false );
	assert.equal( scrumDataManager.IsIntegrityOk(), true );
	assert.equal( scrumDataManager.PriorityListLength(), 3 );
	assert.equal( scrumDataManager.activeDataSet.priorityStartId, 0 );  // nothing changed
	
	result = scrumDataManager.MovePriorityUp( 1 );
	assert.equal( result, true );
	assert.equal( scrumDataManager.IsIntegrityOk(), true );
	assert.equal( scrumDataManager.PriorityListLength(), 3 );
	assert.equal( scrumDataManager.activeDataSet.priorityStartId, 1 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 1 ].previousPriorityId, -1 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 1 ].nextPriorityId, 0 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 0 ].previousPriorityId, 1 );
	
	scrumDataManager.MovePriorityUp( 0 );
	assert.equal( scrumDataManager.IsIntegrityOk(), true );
	assert.equal( scrumDataManager.PriorityListLength(), 3 );
	assert.equal( scrumDataManager.activeDataSet.priorityStartId, 0 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 0 ].previousPriorityId, -1 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 1 ].previousPriorityId, 0 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 0 ].nextPriorityId, 1 );
	
	scrumDataManager.MovePriorityUp( 2 );
	assert.equal( scrumDataManager.IsIntegrityOk(), true );
	assert.equal( scrumDataManager.PriorityListLength(), 3 );
	assert.equal( scrumDataManager.activeDataSet.priorityStartId, 0 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 1 ].previousPriorityId, 2 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 1 ].nextPriorityId, -1 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 2 ].previousPriorityId, 0 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 2 ].nextPriorityId, 1 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 0 ].nextPriorityId, 2 );
});

QUnit.test( "scrum data dirty dirty flag", function( assert ) {
	scrumDataManager.InitTestData();
	assert.equal( scrumDataManager.activeDataSet.dirtyFlag, false );
	assert.equal( scrumDataManager.IsDirty(), false );
	assert.equal( scrumDataManager.activeDataSet.versionCounter, 0 );

	var testData = new scrumDataManager.DataObject( 2 );
	scrumDataManager.UpdateData( testData );
	assert.equal( scrumDataManager.activeDataSet.dirtyFlag, true );
	assert.equal( scrumDataManager.IsDirty(), true );
	assert.equal( scrumDataManager.activeDataSet.versionCounter, 1 );
	scrumDataManager.activeDataSet.dirtyFlag = false;
	
	// first element not moved -> not dirty
	scrumDataManager.MovePriorityUp( 0 );
	assert.equal( scrumDataManager.activeDataSet.dirtyFlag, false );
	assert.equal( scrumDataManager.IsDirty(), false );
	assert.equal( scrumDataManager.activeDataSet.versionCounter, 1 );

	scrumDataManager.MovePriorityUp( 1 );
	assert.equal( scrumDataManager.activeDataSet.dirtyFlag, true );
	assert.equal( scrumDataManager.IsDirty(), true );
	assert.equal( scrumDataManager.activeDataSet.versionCounter, 2 );

});

QUnit.test( "scrum update only informational data, not structure", function( assert ) {
	scrumDataManager.InitTestData();
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 0 ].nextPriorityId, 1 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 0 ].previousPriorityId, -1 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 0 ].featurename, "TestData0" );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 0 ].priority, 0 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 0 ].complexity, 2 );

	var testData = new scrumDataManager.DataObject( 0 );
	testData.featurename = "Changed";
	testData.priority = 3;
	testData.complexity = 8;
	testData.previousPriorityId = 99;
	testData.nextPriorityId = 99;

	scrumDataManager.UpdateData( testData );

	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 0 ].nextPriorityId, 1 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 0 ].previousPriorityId, -1 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 0 ].featurename, "Changed" );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 0 ].complexity, 8 );
});


QUnit.test( "scrum data manager has a name", function( assert ) {
	scrumDataManager.InitTestData();
	assert.equal( scrumDataManager.name, "Default" );
});

QUnit.test( "scrum data manager has initial empty finish list", function( assert ) {
	scrumDataManager.InitTestData();
	assert.equal( scrumDataManager.activeDataSet.lastFinishedId, -1 );
});

QUnit.test( "scrum data manager initiates finish list on first finish", function( assert ) {
	scrumDataManager.InitTestData();
	assert.equal( scrumDataManager.activeDataSet.dirtyFlag, false );
	assert.equal( scrumDataManager.IsDirty(), false );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 0 ].isFinished, false );
	var result = scrumDataManager.SetDoneState( 0, true );
	assert.equal( result, true );
	assert.equal( scrumDataManager.activeDataSet.dirtyFlag, true );
	assert.equal( scrumDataManager.IsDirty(), true );
	assert.equal( scrumDataManager.activeDataSet.lastFinishedId, 0 );
	assert.equal( scrumDataManager.activeDataSet.priorityStartId, 1 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 0 ].nextPriorityId, -1 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 0 ].nextPriorityId, -1 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 0 ].isFinished, true );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 1 ].nextPriorityId, 2 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 1 ].previousPriorityId, -1 );
	// retry must be unsusccessull
	result = scrumDataManager.SetDoneState( 0, true );
	assert.equal( result, false );
});

QUnit.test( "scrum data manager finish on middle element", function( assert ) {
	scrumDataManager.InitTestData();
	assert.equal( scrumDataManager.activeDataSet.dirtyFlag, false );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 1 ].isFinished, false );
	var result = scrumDataManager.SetDoneState( 1, true );
	assert.equal( result, true );
	assert.equal( scrumDataManager.activeDataSet.dirtyFlag, true );
	assert.equal( scrumDataManager.activeDataSet.lastFinishedId, 1 );
	assert.equal( scrumDataManager.activeDataSet.priorityStartId, 0 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 1 ].nextPriorityId, -1 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 1 ].nextPriorityId, -1 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 1 ].isFinished, true );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 0 ].nextPriorityId, 2 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 0 ].previousPriorityId, -1 );
	// retry must be unsusccessull
	result = scrumDataManager.SetDoneState( 1, true );
	assert.equal( result, false );
});

QUnit.test( "scrum data manager finish last element", function( assert ) {
	scrumDataManager.InitTestData();
	assert.equal( scrumDataManager.activeDataSet.dirtyFlag, false );
	assert.equal( scrumDataManager.IsDirty(), false );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 2 ].isFinished, false );
	var result = scrumDataManager.SetDoneState( 2, true );
	assert.equal( result, true );
	assert.equal( scrumDataManager.activeDataSet.dirtyFlag, true );
	assert.equal( scrumDataManager.IsDirty(), true );
	assert.equal( scrumDataManager.activeDataSet.lastFinishedId, 2 );
	assert.equal( scrumDataManager.activeDataSet.priorityStartId, 0 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 2 ].nextPriorityId, -1 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 2 ].nextPriorityId, -1 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 2 ].isFinished, true );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 1 ].nextPriorityId, -1 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 1 ].previousPriorityId, 0 );
	// retry must be unsusccessull
	result = scrumDataManager.SetDoneState( 2, true );
	assert.equal( result, false );
});

QUnit.test( "scrum data manager finish 2", function( assert ) {
	scrumDataManager.InitTestData();
	var result = scrumDataManager.SetDoneState( 1, true );
	assert.equal( result, true );
	assert.equal( scrumDataManager.activeDataSet.lastFinishedId, 1 );
	assert.equal( scrumDataManager.activeDataSet.priorityStartId, 0 );
	// finish first element
	result = scrumDataManager.SetDoneState( 0, true );
	assert.equal( scrumDataManager.activeDataSet.lastFinishedId, 0 );
	assert.equal( scrumDataManager.activeDataSet.priorityStartId, 2 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 0 ].nextPriorityId, 1 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 1 ].previousPriorityId, 0 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 0 ].isFinished, true );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 2 ].nextPriorityId, -1 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 2 ].previousPriorityId, -1 );
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
	assert.equal( scrumDataManager.activeDataSet.lastFinishedId, 2 );
	assert.equal( scrumDataManager.activeDataSet.priorityStartId, -1 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 2 ].nextPriorityId, 1 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 2 ].previousPriorityId, -1 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 1 ].nextPriorityId, 0 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 1 ].previousPriorityId, 2 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 0 ].nextPriorityId, -1 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 0 ].previousPriorityId, 1 );
	assert.notEqual( scrumDataManager.activeDataSet.scrumDataArray[ 0 ].finishDate, undefined );
	assert.notEqual( scrumDataManager.activeDataSet.scrumDataArray[ 1 ].finishDate, undefined );
	assert.notEqual( scrumDataManager.activeDataSet.scrumDataArray[ 2 ].finishDate, undefined );

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
	assert.equal( scrumDataManager.activeDataSet.priorityStartId, 3 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 0 ].nextPriorityId, 1 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 0 ].previousPriorityId, 3 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 3 ].nextPriorityId, 0 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 3 ].previousPriorityId, -1 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 3 ].featurename, "Added" );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 3 ].priority, 3 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 3 ].complexity, 18 );

});

QUnit.test( "scrum data manager initiates reopen on first finished", function( assert ) {
	scrumDataManager.InitTestData();
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 0 ].isFinished, false );
	var result = scrumDataManager.SetDoneState( 0, true );
	assert.equal( result, true );
    result = scrumDataManager.SetDoneState( 1, false );
	assert.equal( result, false );  // reopen on opened element fails
    result = scrumDataManager.SetDoneState( 0, false );
	assert.equal( result, true );
	assert.equal( scrumDataManager.activeDataSet.lastFinishedId, -1 );
	assert.equal( scrumDataManager.activeDataSet.priorityStartId, 0 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 0 ].nextPriorityId, 1 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 0 ].previousPriorityId, -1 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 0 ].isFinished, false );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 1 ].nextPriorityId, 2 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 1 ].previousPriorityId, 0 );
	// retry must be unsusccessull
	result = scrumDataManager.SetDoneState( 0, false );
	assert.equal( result, false );
});

QUnit.test( "scrum data manager reopen middle element", function( assert ) {
	scrumDataManager.InitTestData();
	assert.equal( scrumDataManager.activeDataSet.dirtyFlag, false );
	assert.equal( scrumDataManager.IsDirty(), false );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 1 ].isFinished, false );
	var result = scrumDataManager.SetDoneState( 1, true );
	assert.equal( result, true );
    result = scrumDataManager.SetDoneState( 1, false );
	assert.equal( result, true );
	assert.equal( scrumDataManager.activeDataSet.dirtyFlag, true );
	assert.equal( scrumDataManager.IsDirty(), true );
	assert.equal( scrumDataManager.activeDataSet.lastFinishedId, -1 );
	assert.equal( scrumDataManager.activeDataSet.priorityStartId, 1 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 1 ].nextPriorityId, 0 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 1 ].previousPriorityId, -1 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 1 ].isFinished, false );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 0 ].nextPriorityId, 2 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 0 ].previousPriorityId, 1 );
	// retry must be unsusccessull
	result = scrumDataManager.SetDoneState( 1, false );
	assert.equal( result, false );
});

QUnit.test( "scrum data manager reopen last element", function( assert ) {
	scrumDataManager.InitTestData();
	assert.equal( scrumDataManager.activeDataSet.dirtyFlag, false );
	assert.equal( scrumDataManager.IsDirty(), false );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 2 ].isFinished, false );
	var result = scrumDataManager.SetDoneState( 2, true );
	assert.equal( result, true );
    result = scrumDataManager.SetDoneState( 2, false );
	assert.equal( result, true );
	assert.equal( scrumDataManager.activeDataSet.dirtyFlag, true );
	assert.equal( scrumDataManager.IsDirty(), true );
	assert.equal( scrumDataManager.activeDataSet.lastFinishedId, -1 );
	assert.equal( scrumDataManager.activeDataSet.priorityStartId, 2 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 2 ].nextPriorityId, 0 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 2 ].previousPriorityId, -1 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 2 ].isFinished, false );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 1 ].nextPriorityId, -1 );
	assert.equal( scrumDataManager.activeDataSet.scrumDataArray[ 1 ].previousPriorityId, 0 );
	// retry must be unsusccessull
	result = scrumDataManager.SetDoneState( 2, false );
	assert.equal( result, false );
});

QUnit.test( "scrum data manager should compute sum and oldest date\
              return allways something",
    function( assert ) {
	scrumDataManager.InitTestData();
    scrumDataManager.activeDataSet.scrumDataArray = new Array();
    var result = scrumDataManager.GetSumAndOldestDateOfFinished();
	assert.equal( result.sum, 0 );
	assert.notEqual( result.oldestDate, undefined );
});

QUnit.test( "scrum data manager should compute sum and oldest date",
    function( assert ) {
	scrumDataManager.InitTestData();
    var oldest = new Date( 2003, 6, 1 );
    scrumDataManager.activeDataSet.scrumDataArray[ 0 ].finishDate = new Date( 2003, 6, 8 );
    scrumDataManager.activeDataSet.scrumDataArray[ 0 ].complexity = 40;
    scrumDataManager.activeDataSet.scrumDataArray[ 0 ].isFinished = true;
    scrumDataManager.activeDataSet.scrumDataArray[ 1 ].finishDate = oldest;
    scrumDataManager.activeDataSet.scrumDataArray[ 1 ].complexity = 13;
    scrumDataManager.activeDataSet.scrumDataArray[ 1 ].isFinished = true;
    scrumDataManager.activeDataSet.scrumDataArray[ 2 ].finishDate = new Date( 2003, 6, 15 );
    scrumDataManager.activeDataSet.scrumDataArray[ 2 ].complexity = 8;
    scrumDataManager.activeDataSet.scrumDataArray[ 2 ].isFinished = false;
    var result = scrumDataManager.GetSumAndOldestDateOfFinished();
	assert.equal( result.sum, 61 );
	assert.equal( result.oldestDate, oldest );
});

QUnit.test( "scrum data manager should compute relative weeks",
    function( assert ) {
    var oldest = new Date( 2003, 6, 1 );
    var other  = new Date( 2003, 6, 1 );
	assert.equal( scrumDataManager.GetRelativeWeek( oldest, other ), 0 );
    other  = new Date( 2003, 6, 7 );
	assert.equal( scrumDataManager.GetRelativeWeek( oldest, other ), 0 );
    other  = new Date( 2003, 6, 8 );
	assert.equal( scrumDataManager.GetRelativeWeek( oldest, other ), 1 );
    other  = new Date( 2003, 6, 15 );
	assert.equal( scrumDataManager.GetRelativeWeek( oldest, other ), 2 );
    other  = new Date( 2003, 7, 1 );
	assert.equal( scrumDataManager.GetRelativeWeek( oldest, other ), 4 );
    other  = new Date( 2004, 6, 1 );
	assert.equal( scrumDataManager.GetRelativeWeek( oldest, other ), 52 );
    other  = new Date( 2005, 6, 1 );
	assert.equal( scrumDataManager.GetRelativeWeek( oldest, other ), 104 );

});

QUnit.test( "scrum data manager should generate chart data",
    function( assert ) {
	scrumDataManager.InitTestData();
    scrumDataManager.activeDataSet.scrumDataArray[ 0 ].finishDate = new Date( 2003, 6, 8 );
    scrumDataManager.activeDataSet.scrumDataArray[ 0 ].complexity = 40;
    scrumDataManager.activeDataSet.scrumDataArray[ 0 ].isFinished = false;
    scrumDataManager.activeDataSet.scrumDataArray[ 1 ].finishDate = new Date( 2003, 6, 1 );
    scrumDataManager.activeDataSet.scrumDataArray[ 1 ].complexity = 13;
    scrumDataManager.activeDataSet.scrumDataArray[ 1 ].isFinished = true;
    scrumDataManager.activeDataSet.scrumDataArray[ 2 ].finishDate = new Date( 2003, 6, 22 );
    scrumDataManager.activeDataSet.scrumDataArray[ 2 ].complexity = 8;
    scrumDataManager.activeDataSet.scrumDataArray[ 2 ].isFinished = true;
    var result = scrumDataManager.GetWeekBasedChartData();
	assert.equal( result.dataArray[ 0 ], 61 ); // sum of all
	assert.equal( result.dataArray[ 1 ], 48 ); // sum  - 13
	assert.equal( result.dataArray[ 2 ], 48 ); // nothing changed
	assert.equal( result.dataArray[ 3 ], 48 ); // no entry, must be same as before
	assert.equal( result.dataArray[ 4 ], 40 ); // remaining - 8
    assert.equal( result.labelArray[ 0 ], '' );
	assert.equal( result.labelArray[ 1 ], '2003-7-1' ); 
	assert.equal( result.labelArray[ 2 ], '2003-7-8' );
	assert.equal( result.labelArray[ 3 ], '2003-7-15' );
	assert.equal( result.labelArray[ 4 ], '2003-7-22' );

});

QUnit.test( "scrum data manager chart data with two values in 1 week",
    function( assert ) {
	scrumDataManager.InitTestData();
    scrumDataManager.activeDataSet.scrumDataArray[ 0 ].finishDate = new Date( 2003, 6, 8 );
    scrumDataManager.activeDataSet.scrumDataArray[ 0 ].complexity = 40;
    scrumDataManager.activeDataSet.scrumDataArray[ 0 ].isFinished = false;
    scrumDataManager.activeDataSet.scrumDataArray[ 1 ].finishDate = new Date( 2003, 6, 1 );
    scrumDataManager.activeDataSet.scrumDataArray[ 1 ].complexity = 13;
    scrumDataManager.activeDataSet.scrumDataArray[ 1 ].isFinished = true;
    scrumDataManager.activeDataSet.scrumDataArray[ 2 ].finishDate = new Date( 2003, 6, 7 );
    scrumDataManager.activeDataSet.scrumDataArray[ 2 ].complexity = 8;
    scrumDataManager.activeDataSet.scrumDataArray[ 2 ].isFinished = true;
    var result = scrumDataManager.GetWeekBasedChartData();
	assert.equal( result.dataArray[ 0 ], 61 ); // sum of all
	assert.equal( result.dataArray[ 1 ], 40 ); // sum  - 13 - 8
	assert.equal( result.dataArray[ 2 ], undefined ); // nothing changed
});

QUnit.test( "scrum data manager should generate strings names for relative weeks",
    function( assert ) {
    var oldest = new Date( 2003, 6, 1 );
	assert.equal( scrumDataManager.GetRelativeWeekName( oldest, 0 ), '2003-7-1' );
	assert.equal( scrumDataManager.GetRelativeWeekName( oldest, 1 ), '2003-7-8' );
	assert.equal( scrumDataManager.GetRelativeWeekName( oldest, 2 ), '2003-7-15' );
	assert.equal( scrumDataManager.GetRelativeWeekName( oldest, 4 ), '2003-7-29' );
	assert.equal( scrumDataManager.GetRelativeWeekName( oldest, 52 ), '2004-6-29' );
});

QUnit.test( "scrum data manager creates empty data set.",
    function( assert ) {
    var testSet = new scrumDataManager.DataSet( "TestCreation" );
	assert.notEqual( testSet.scrumDataArray, undefined );
	assert.equal( testSet.scrumDataArray.constructor, Array );
	assert.equal( testSet.priorityStartId, -1 );
	assert.equal( testSet.lastFinishedId, -1 );
	assert.equal( testSet.dirtyFlag, false );
	assert.equal( testSet.name, "TestCreation" );
	assert.equal( testSet.versionCounter, 0 );
});


QUnit.test( "scrum data manager should generate project information",
    function( assert ) {
	scrumDataManager.InitTestData();
    scrumDataManager.activeDataSet.scrumDataArray[ 0 ].finishDate = new Date( 2003, 6, 8 );
    scrumDataManager.activeDataSet.scrumDataArray[ 0 ].complexity = 40;
    scrumDataManager.activeDataSet.scrumDataArray[ 0 ].isFinished = false;
    scrumDataManager.activeDataSet.scrumDataArray[ 1 ].finishDate = new Date( 2003, 6, 1 );
    scrumDataManager.activeDataSet.scrumDataArray[ 1 ].complexity = 13;
    scrumDataManager.activeDataSet.scrumDataArray[ 1 ].isFinished = true;
    scrumDataManager.activeDataSet.scrumDataArray[ 2 ].finishDate = new Date( 2003, 6, 8 );
    scrumDataManager.activeDataSet.scrumDataArray[ 2 ].complexity = 8;
    scrumDataManager.activeDataSet.scrumDataArray[ 2 ].isFinished = true;
    var result = scrumDataManager.GetProjectInformation();
	assert.equal( result.tasksOpen, 1 );
	assert.equal( result.tasksDone, 2 );
	assert.equal( result.velocity, 7 );
});



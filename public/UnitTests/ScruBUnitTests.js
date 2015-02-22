
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
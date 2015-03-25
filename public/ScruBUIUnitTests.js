QUnit.test( "ScruB should fix list ordering",
    function( assert ) {
    // starting with data array
	scrumDataManager.InitTestData();
    // fix html list
    CheckScrumListIntegrity();
    var nextListElement = $( "#scrumListId0" );
    assert.notEqual( nextListElement, undefined );
    nextListElement = nextListElement.next();
    assert.notEqual( nextListElement, undefined );
    assert.equal( nextListElement.attr( "id" ), "scrumListId1" );

});

QUnit.test( "ScruB should add missing elements in list",
    function( assert ) {
	scrumDataManager.InitTestData();
    $( "#scrumListId1").remove();  // one element missing
    CheckScrumListIntegrity(); // should add a list element
    assert.equal( $( "#scrumListId0" ).next().attr( "id"), "scrumListId1" );
});

QUnit.test( "ScruB should update project information",
    function( assert ) {
	scrumDataManager.InitTestData();
    scrumDataManager.activeDataSet.connectedDevices = 1;
    assert.equal( $( "#ProjectName").text(), '' );  
    assert.equal( $( "#ProjectNumberOfTasks").text(), '' );  
    assert.equal( $( "#ProjectTasksOpen").text(), '' );  
    assert.equal( $( "#ProjectTasksDone").text(), '' );  
    assert.equal( $( "#ProjectVelocity").text(), '' );  
    assert.equal( $( "#ProjectConnectedDevices").text(), '' );  
    UpdateProjectInformation(); // should add a list element
    assert.equal( $( "#ProjectName").text(), 'Default' );  
    assert.equal( $( "#ProjectNumberOfTasks").text(), '3' );  
    assert.equal( $( "#ProjectTasksOpen").text(), '3' );  
    assert.equal( $( "#ProjectVelocity").text(), '0' );  
    assert.equal( $( "#ProjectConnectedDevices").text(), '1' );  
});


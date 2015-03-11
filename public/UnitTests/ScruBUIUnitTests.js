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


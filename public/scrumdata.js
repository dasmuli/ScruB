
/* Server and client use this array to store scrum data. */
var scrumDataArray = new Array();

var ScrumData = {  // Default value of properties
  id: 					-1,
  featurename:			"not named", 
  complexity:			8,
  priority:				1,
  previousPriorityId:	-1,
  nextPriorityId:		-1,
  printData : function(){  // Method which will display type of Animal
    console.log( 'scrumdata ' + this.id + " " + this.featurename + ' ' + complextiy );
  }
}

var scrumDataManager = {
	priorityStartId: 0,
	DataObject: function ( id ) {
		this.id 				= id;
		this.featurename 		= "TestData" + id;
		this.complexity 		= 2;
		this.previousPriorityId = -1;
		this.nextPriorityId		= -1;
	},
    InitTestData: function () {
		console.log( "Init test data called." );
		scrumDataArray = new Array();
		for( i = 0; i < 3; i++ )
		{
			scrumDataArray[ i ] = new scrumDataManager.DataObject( i );
			if( i < 2 )
			{
				scrumDataArray[ i ].nextPriorityId = i + 1;
			}
			if( i > 0 )
			{
				scrumDataArray[ i ].previousPriorityId = i - 1;
			}
		}
    },
	PriorityListLength: function () {
		var currentData = scrumDataArray[ scrumDataManager.priorityStartId ];
		var count = 0;
		console.log( "currentData id: " + currentData.id + ", next: " + currentData.nextPriorityId );
		while( currentData.nextPriorityId != -1 && count < scrumDataArray.length )
		{
			console.log( "scrumDataManager.PriorityListLength: next" );
			currentData = scrumDataArray[ currentData.nextPriorityId ];
			count++;
		}
		return count + 1;
    },
	IsIntegrityOk: function () {
		// check ids are existing exactly once
		for( i = 0; i < scrumDataArray.length; i++ )
		{
			if( scrumDataArray[ i ].id != i )
			{
				return false;
			}
		}
		// check priority list is ok
		var currentData = scrumDataArray[ scrumDataManager.priorityStartId ];
		if( currentData.previousPriorityId != -1 )
		{
			console.log( "scrumDataManager.IsIntegrityOk: Initial priority field " + currentData.id + " has previous element" );
			return false;
		}
		var count = 0;
		while( currentData.nextPriorityId != -1 && count < scrumDataArray.length )
		{
			nextData = scrumDataArray[ currentData.nextPriorityId ];
			if( nextData.previousPriorityId != currentData.id )
			{
				console.log( "scrumDataManager.IsIntegrityOk: Linked list error: " + nextData.id + " has not set "
					+ currentData.id + " as previous element, but is the successor.");
				return false;
			}
			currentData = nextData;
			count++;
		}
		if( count >= scrumDataArray.length )
		{
			console.log( "scrumDataManager.IsIntegrityOk: Too many elements in priority list" );
			return false;
		}
		return true;
	}
}
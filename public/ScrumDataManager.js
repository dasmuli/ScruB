
/* Server and client use this object to store scrum data. */
var scrumDataArray = new Array();

var ScrumData = {  // Default value of properties
  id: 					-1,
  featurename:			"not named", 
  complexity:			8,
  priority:				1,
  previousPriorityId:	-1,
  nextPriorityId:		-1,
  printData : function(){  
    console.log( 'scrumdata ' + this.id + " " + this.featurename + ' ' + complextiy );
  }
}

var scrumDataManager = {
	priorityStartId: 0,
	lastFinishedId: -1,
	dirtyFlag: false,
	name: "Default",
	versionCounter: 0,
	DataObject: function ( id ) {
		this.id 				= id;
		this.featurename 		= "TestData" + id;
		this.complexity 		= 2;
		this.isFinished 		= false;
		this.priority			= -1;
		this.previousPriorityId 	= -1;
		this.nextPriorityId		= -1;
	},
	IsDirty: function () {
		return this.dirtyFlag;
	},
	Finish: function ( id ) {
		console.log( "Finish:" + id );
		if( scrumDataArray[ id ].isFinished )
		{
		    return false;
		}
	        var oldNext = scrumDataArray[ id ].nextPriorityId;
                var oldPrevious = scrumDataArray[ id ].previousPriorityId;

		scrumDataArray[ id ].isFinished = true;
		scrumDataArray[ id ].nextPriorityId = scrumDataManager.lastFinishedId;
		scrumDataArray[ id ].previousPriorityId = -1;
		// fix open list
		if( oldPrevious != -1 )
		{
	            scrumDataArray[ oldPrevious ].nextPriorityId = oldNext;
		}
		if( oldNext != -1 )
		{
	            scrumDataArray[ oldNext ].previousPriorityId = oldPrevious;
		}
                if( scrumDataManager.priorityStartId == id )
		{
		    scrumDataManager.priorityStartId = oldNext;
		}
		// fix finished list
		if( !(scrumDataManager.lastFinishedId == -1) )
		{
		   scrumDataArray[ scrumDataManager.lastFinishedId ].previousPriorityId = id;
		}
                scrumDataManager.lastFinishedId = id;
                this.dirtyFlag = true;
		this.versionCounter++;
		return true;
	},

	UpdateData: function ( data ) {
		scrumDataArray[ data.id ].featurename = data.featurename;
		scrumDataArray[ data.id ].complexity  = data.complexity;
		scrumDataArray[ data.id ].priority    = data.priority;
		this.dirtyFlag = true;
		this.versionCounter++;
	},
	AddDataToFront: function ( data ) {
		console.log( "Adding data at array pos:" + scrumDataArray.length );
	        var newPos = scrumDataArray.length;
		scrumDataArray.push( data );
		scrumDataArray[ newPos ].previousPriorityId = -1;
		scrumDataArray[ newPos ].nextPriorityId     = scrumDataManager.priorityStartId;
		if( scrumDataManager.priorityStartId != -1 )
		{
		    scrumDataArray[ scrumDataManager.priorityStartId ].previousPriorityId = newPos;
		}
		scrumDataManager.priorityStartId = newPos;
		this.dirtyFlag = true;
		this.versionCounter++;
	},

    InitTestData: function () {
		scrumDataArray = new Array();
		scrumDataManager.priorityStartId = 0;
		scrumDataManager.lastFinishedId = -1;
		for( i = 0; i < 3; i++ )
		{
			scrumDataArray[ i ] = new scrumDataManager.DataObject( i );
			scrumDataArray[ i ].priority = i;
			if( i < 2 )
			{
				scrumDataArray[ i ].nextPriorityId = i + 1;
			}
			if( i > 0 )
			{
				scrumDataArray[ i ].previousPriorityId = i - 1;
			}
		}
		this.dirtyFlag = false;
		this.versionCounter = 0;
    },
	PriorityListLength: function () {
		var currentData = scrumDataArray[ scrumDataManager.priorityStartId ];
		var count = 0;
		while( currentData.nextPriorityId != -1 && count < scrumDataArray.length )
		{
			currentData = scrumDataArray[ currentData.nextPriorityId ];
			count++;
		}
		return count + 1;
    },
	MovePriorityUp: function ( dataToBeMovedUp ) {
		if( scrumDataArray[ dataToBeMovedUp ].previousPriorityId != -1 ) // cannot be moved if first element
		{
			// get all involved ids
			var dataToBeMovedDown = scrumDataArray[ dataToBeMovedUp ].previousPriorityId;
			var precedingElementId = scrumDataArray[ dataToBeMovedDown ].previousPriorityId
			var followingElementId = scrumDataArray[ dataToBeMovedUp ].nextPriorityId;
			// change order of elements
			scrumDataArray[ dataToBeMovedDown ].previousPriorityId = dataToBeMovedUp;
			scrumDataArray[ dataToBeMovedUp ].nextPriorityId = dataToBeMovedDown;
			scrumDataArray[ dataToBeMovedUp ].previousPriorityId = precedingElementId;
			scrumDataArray[ dataToBeMovedDown ].nextPriorityId = followingElementId;
			// change order outer elements
			if( precedingElementId != -1 )
			{
				scrumDataArray[ precedingElementId ].nextPriorityId = dataToBeMovedUp;
			}
			if( followingElementId != -1 )
			{
				scrumDataArray[ followingElementId ].previousPriorityId = dataToBeMovedDown;
			}
			// new first element
			if( scrumDataArray[ dataToBeMovedUp ].previousPriorityId == -1 ) 
			{
				this.priorityStartId = dataToBeMovedUp;
			}
			this.dirtyFlag = true;
			this.versionCounter++;
			return true;
		}
		else
		{
			return false;
		}
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

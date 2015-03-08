
/* Server and client use this object to store scrum data. */
//var scrumDataArray = new Array();

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
	scrumDataArray: [],
	priorityStartId: 0,
	lastFinishedId: -1,
	dirtyFlag: false,
	name: "Default",
	versionCounter: 0,
	finishDate: new Date(),
	commandToClient: {
	    ADD_DATA_TO_FRONT: 'addDataToFront',
	    FINISH:            'finishData',
	    UPDATE_DATA:       'updateData',
	    REOPEN:            'reopenData'
	},
    commandToServer: {
	    ADD_DATA_TO_FRONT: 'addDataToFront',
	    UPDATE_DATA:       'updateData',
	    FINISH:            'finishData',
	    REOPEN:            'reopenData'
	},

	DataObject: function ( id ) {
		this.id 				= id;
		this.featurename 		= "TestData" + id;
		this.complexity 		= 2;
		this.isFinished 		= false;
		this.priority			= -1;
		this.previousPriorityId	= -1;
		this.nextPriorityId		= -1;
        this.finishDate         = new Date();
	},
	IsDirty: function () {
		return this.dirtyFlag;
	},
	SetDoneState: function ( id, toDoneState ) {
		if( this.scrumDataArray[ id ].isFinished == toDoneState )
		{
		    console.log( "State allready reached: "
                         + id + ", state: " + toDoneState );
		    return false;
		}
        var oldListLeader = this.lastFinishedId;
        if( !toDoneState )
        {
            oldListLeader = this.priorityStartId;
        }
	    var oldNext = this.scrumDataArray[ id ].nextPriorityId;
        var oldPrevious = this.scrumDataArray[ id ].previousPriorityId;

		this.scrumDataArray[ id ].isFinished = toDoneState;
		this.scrumDataArray[ id ].finishDate = new Date();
		this.scrumDataArray[ id ].nextPriorityId = oldListLeader;
		this.scrumDataArray[ id ].previousPriorityId = -1;
		// fix old list
		if( oldPrevious != -1 )
		{
	            this.scrumDataArray[ oldPrevious ].nextPriorityId = oldNext;
		}
		if( oldNext != -1 )
		{
	            this.scrumDataArray[ oldNext ].previousPriorityId = oldPrevious;
		}
        if( toDoneState && scrumDataManager.priorityStartId === id )
		{
		    this.priorityStartId = oldNext;
		}
        if( !toDoneState && scrumDataManager.lastFinishedId === id )
		{
		    this.lastFinishedId = oldNext;
		}
		// fix new list
        if( toDoneState )
        {
		    if( !( this.lastFinishedId === -1) )
		    {
		       this.scrumDataArray[ this.lastFinishedId ].previousPriorityId = id;
		    }
            this.lastFinishedId = id;
        }
        else
        {
            if( !( this.priorityStartId === -1) )
		    {
		       this.scrumDataArray[ this.priorityStartId ].previousPriorityId = id;
		    }
            this.priorityStartId = id;

        }
        this.dirtyFlag = true;
		this.versionCounter++;
		return true;
	},

	UpdateData: function ( data ) {
		this.scrumDataArray[ data.id ].featurename = data.featurename;
		this.scrumDataArray[ data.id ].complexity  = data.complexity;
		this.scrumDataArray[ data.id ].description = data.description;
		this.dirtyFlag = true;
		this.versionCounter++;
	},
	AddDataToFront: function ( data ) {
	        var newPos = this.scrumDataArray.length;
		this.scrumDataArray.push( data );
		this.scrumDataArray[ newPos ].id                 = this.scrumDataArray.length - 1;
		this.scrumDataArray[ newPos ].previousPriorityId = -1;
		this.scrumDataArray[ newPos ].nextPriorityId     = this.priorityStartId;
		if( this.priorityStartId != -1 )
		{
		    this.scrumDataArray[ this.priorityStartId ].previousPriorityId = newPos;
		}
		this.priorityStartId = newPos;
		this.dirtyFlag = true;
		this.versionCounter++;
	},

    InitTestData: function () {
		this.scrumDataArray = new Array();
		this.priorityStartId = 0;
		this.lastFinishedId = -1;
		for( i = 0; i < 3; i++ )
		{
			this.scrumDataArray[ i ] = new this.DataObject( i );
			this.scrumDataArray[ i ].priority = i;
			if( i < 2 )
			{
				this.scrumDataArray[ i ].nextPriorityId = i + 1;
			}
			if( i > 0 )
			{
				this.scrumDataArray[ i ].previousPriorityId = i - 1;
			}
		}
		this.dirtyFlag = false;
		this.versionCounter = 0;
    },
    GetRelativeWeek: function( baseDate, relativeDate )
    {
        return Math.floor( ( relativeDate - baseDate ) / ( 604800000 ) );
    },
    GetRelativeWeekName: function( baseDate, relativeWeek )
    {
        var millisecondsRelativeWeek = Math.floor(  baseDate.getTime() + relativeWeek * 604800000 );
        var date = new Date( millisecondsRelativeWeek );
        return date.getFullYear()+'-'+date.getMonth()+'-'+date.getDate();
    },
    GetWeekBasedChartData: function()
    {
        var sumDate = this.GetSumAndOldestDateOfFinished();
        var baseDate = sumDate.oldestDate;
        var result = [];
        result[ 0 ] = sumDate.sum;
        var maxLength = this.scrumDataArray.length;
        var relativeWeek;
        var i;
        // go through data and add complexity to relative week
        for ( i = 0; i < maxLength; i++ )
        {
            if( this.scrumDataArray[ i ].isFinished )
            {
                relativeWeek = this.GetRelativeWeek( baseDate,
                             this.scrumDataArray[ i ].finishDate ) + 1;
                if( result[ relativeWeek ] == undefined )
                {
                    result[ relativeWeek ] = this.scrumDataArray[ i ].complexity;
                }
                else
                {
                    result[ relativeWeek ] += this.scrumDataArray[ i ].complexity;
                }
            }
        }
        // fix array holes
        var previousValue = sumDate.sum;
        maxLength = result.length;
        for ( i = 1; i < maxLength; i++ )
        {
            if( result[ i ] == undefined )
            {
                result[ i ] = previousValue;
            }
            else
            {
                result[ i ]  = previousValue - result[ i ];
                previousValue = result[ i ];
            }
        }
        // create name array
        var nameArray = [];
        nameArray[ 0 ] = '';
        for ( i = 1; i < maxLength; i++ )
        {
            nameArray[i ] = this.GetRelativeWeekName( baseDate, i );
        }
        var resultObj = { 
            dataArray: result,
            labelArray: nameArray
        };
        return resultObj;
    },
    GetSumAndOldestDateOfFinished: function() {
       var result = {};
       result.sum = 0;
       result.oldestDate = new Date ( 9999, 1, 1 );
       var maxLength = this.scrumDataArray.length;
       for ( var i = 0; i < maxLength; i++ )
       {
           result.sum += this.scrumDataArray[ i ].complexity;
           if( this.scrumDataArray[ i ].isFinished )
           {
               if( this.scrumDataArray[ i ].finishDate != undefined &&
                   this.scrumDataArray[ i ].finishDate < result.oldestDate )
               {
                   result.oldestDate = this.scrumDataArray[ i ].finishDate;
               }
           }
       }
       return result;
    },
	PriorityListLength: function () {
		var currentData = this.scrumDataArray[ this.priorityStartId ];
		var count = 0;
		while( currentData.nextPriorityId != -1 && count < this.scrumDataArray.length )
		{
			currentData = this.scrumDataArray[ currentData.nextPriorityId ];
			count++;
		}
		return count + 1;
    },
	MovePriorityUp: function ( dataToBeMovedUp ) {
		if( this.scrumDataArray[ dataToBeMovedUp ].previousPriorityId != -1 )
			// cannot be moved if first element
		{
			// get all involved ids
			var dataToBeMovedDown = this.scrumDataArray[ dataToBeMovedUp ].previousPriorityId;
			var precedingElementId = this.scrumDataArray[ dataToBeMovedDown ].previousPriorityId
			var followingElementId = this.scrumDataArray[ dataToBeMovedUp ].nextPriorityId;
			// change order of elements
			this.scrumDataArray[ dataToBeMovedDown ].previousPriorityId = dataToBeMovedUp;
			this.scrumDataArray[ dataToBeMovedUp ].nextPriorityId = dataToBeMovedDown;
			this.scrumDataArray[ dataToBeMovedUp ].previousPriorityId = precedingElementId;
			this.scrumDataArray[ dataToBeMovedDown ].nextPriorityId = followingElementId;
			// change order outer elements
			if( precedingElementId != -1 )
			{
				this.scrumDataArray[ precedingElementId ].nextPriorityId = dataToBeMovedUp;
			}
			if( followingElementId != -1 )
			{
				this.scrumDataArray[ followingElementId ].previousPriorityId = dataToBeMovedDown;
			}
			// new first element
			if( this.scrumDataArray[ dataToBeMovedUp ].previousPriorityId == -1 ) 
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
		for( i = 0; i < this.scrumDataArray.length; i++ )
		{
			if( this.scrumDataArray[ i ].id != i )
			{
				return false;
			}
		}
		// check priority list is ok
		var currentData = this.scrumDataArray[ this.priorityStartId ];
		if( currentData.previousPriorityId != -1 )
		{
			console.log( "scrumDataManager.IsIntegrityOk: Initial priority field " 
				+ currentData.id + " has previous element" );
			return false;
		}
		var count = 0;
		while( currentData.nextPriorityId != -1 && count < this.scrumDataArray.length )
		{
			nextData = this.scrumDataArray[ currentData.nextPriorityId ];
			if( nextData.previousPriorityId != currentData.id )
			{
				console.log( "scrumDataManager.IsIntegrityOk: Linked list error: " 
						+ nextData.id + " has not set "
					        + currentData.id 
						+ " as previous element, but is the successor.");
				return false;
			}
			currentData = nextData;
			count++;
		}
		if( count >= this.scrumDataArray.length )
		{
			console.log( "scrumDataManager.IsIntegrityOk: Too many elements in priority list" );
			return false;
		}
		return true;
	}
}

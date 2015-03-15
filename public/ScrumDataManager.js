
/* Server and client use this object to store scrum data. */

var scrumDataManager = {
    activeDataSet: {},
    scrumDataArray: [],
	priorityStartId: 0,
	lastFinishedId: -1,
	dirtyFlag: false,
	name: "Default",
	versionCounter: 0,
	commandToClient: {
	    ADD_DATA_TO_FRONT: 'addDataToFront',
	    FINISH:            'finishData',
	    UPDATE_DATA:       'updateData',
	    FULL_DATA:         'scrubfulldata',
	    REOPEN:            'reopenData'
	},
    commandToServer: {
	    ADD_DATA_TO_FRONT:        'addDataToFront',
	    UPDATE_DATA:              'updateData',
	    FULL_DATA:                'scrubfulldata',
	    FINISH:                   'finishData',
	    REOPEN:                   'reopenData',
	    CREATE_ANONYMOUS_PROJECT: 'createAnonymousProject'
	},
    // represents a complete project data set
    DataSet: function( name ) {
        this.scrumDataArray     = [];
        this.priorityStartId    = -1;
        this.lastFinishedId     = -1;
        this.dirtyFlag          = false;
        this.name               = name;
        this.versionCounter     = 0;
    },
    // represents a single task / issue,
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
    InitEmptyDataSet: function()
    {
        this.activeDataSet = new this.DataSet( "Unset" );
    },
	IsDirty: function () {
		return this.activeDataSet.dirtyFlag;
	},
	SetDoneState: function ( id, toDoneState ) {
		if( this.activeDataSet.scrumDataArray[ id ].isFinished == toDoneState )
		{
		    console.log( "State allready reached: "
                         + id + ", state: " + toDoneState );
		    return false;
		}
        var oldListLeader = this.activeDataSet.lastFinishedId;
        if( !toDoneState )
        {
            oldListLeader = this.activeDataSet.priorityStartId;
        }
	    var oldNext = this.activeDataSet.scrumDataArray[ id ].nextPriorityId;
        var oldPrevious = this.activeDataSet.scrumDataArray[ id ].previousPriorityId;

		this.activeDataSet.scrumDataArray[ id ].isFinished = toDoneState;
		this.activeDataSet.scrumDataArray[ id ].finishDate = new Date();
		this.activeDataSet.scrumDataArray[ id ].nextPriorityId = oldListLeader;
		this.activeDataSet.scrumDataArray[ id ].previousPriorityId = -1;
		// fix old list
		if( oldPrevious != -1 )
		{
	            this.activeDataSet.scrumDataArray[ oldPrevious ].nextPriorityId = oldNext;
		}
		if( oldNext != -1 )
		{
	            this.activeDataSet.scrumDataArray[ oldNext ].previousPriorityId = oldPrevious;
		}
        if( toDoneState && this.activeDataSet.priorityStartId === id )
		{
		    this.activeDataSet.priorityStartId = oldNext;
		}
        if( !toDoneState && this.activeDataSet.lastFinishedId === id )
		{
		    this.activeDataSet.lastFinishedId = oldNext;
		}
		// fix new list
        if( toDoneState )
        {
		    if( !( this.activeDataSet.lastFinishedId === -1) )
		    {
		       this.activeDataSet.scrumDataArray[ this.activeDataSet.lastFinishedId ].previousPriorityId = id;
		    }
            this.activeDataSet.lastFinishedId = id;
        }
        else
        {
            if( !( this.activeDataSet.priorityStartId === -1) )
		    {
		       this.activeDataSet.scrumDataArray[ this.activeDataSet.priorityStartId ].previousPriorityId = id;
		    }
            this.activeDataSet.priorityStartId = id;

        }
        this.activeDataSet.dirtyFlag = true;
		this.activeDataSet.versionCounter++;
		return true;
	},

	UpdateData: function ( data ) {
		this.activeDataSet.scrumDataArray[ data.id ].featurename = data.featurename;
		this.activeDataSet.scrumDataArray[ data.id ].complexity  = data.complexity;
		this.activeDataSet.scrumDataArray[ data.id ].description = data.description;
		this.activeDataSet.dirtyFlag = true;
		this.activeDataSet.versionCounter++;
	},
	AddDataToFront: function ( data ) {
	        var newPos = this.activeDataSet.scrumDataArray.length;
		this.activeDataSet.scrumDataArray.push( data );
		this.activeDataSet.scrumDataArray[ newPos ].id                 = this.activeDataSet.scrumDataArray.length - 1;
		this.activeDataSet.scrumDataArray[ newPos ].previousPriorityId = -1;
		this.activeDataSet.scrumDataArray[ newPos ].nextPriorityId     = this.activeDataSet.priorityStartId;
		if( this.activeDataSet.priorityStartId != -1 )
		{
		    this.activeDataSet.scrumDataArray[ this.activeDataSet.priorityStartId ].previousPriorityId = newPos;
		}
		this.activeDataSet.priorityStartId = newPos;
		this.activeDataSet.dirtyFlag = true;
		this.activeDataSet.versionCounter++;
	},
    InitTestData: function () {
		this.activeDataSet.scrumDataArray = new Array();
		this.activeDataSet.priorityStartId = 0;
		this.activeDataSet.lastFinishedId = -1;
		for( i = 0; i < 3; i++ )
		{
			this.activeDataSet.scrumDataArray[ i ] = new this.DataObject( i );
			this.activeDataSet.scrumDataArray[ i ].priority = i;
			if( i < 2 )
			{
				this.activeDataSet.scrumDataArray[ i ].nextPriorityId = i + 1;
			}
			if( i > 0 )
			{
				this.activeDataSet.scrumDataArray[ i ].previousPriorityId = i - 1;
			}
		}
		this.activeDataSet.dirtyFlag = false;
		this.activeDataSet.versionCounter = 0;
    },
    GetRelativeWeek: function( baseDate, relativeDate )
    {
        return Math.floor( ( relativeDate - baseDate ) / ( 604800000 ) );
    },
    GetRelativeWeekName: function( baseDate, relativeWeek )
    {
        var millisecondsRelativeWeek = Math.floor(  baseDate.getTime() + relativeWeek * 604800000 );
        var date = new Date( millisecondsRelativeWeek );
        return date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();
    },
    GetWeekBasedChartData: function()
    {
        var sumDate = this.GetSumAndOldestDateOfFinished();
        var baseDate = sumDate.oldestDate;
        var result = [];
        result[ 0 ] = sumDate.sum;
        var maxLength = this.activeDataSet.scrumDataArray.length;
        var relativeWeek;
        var i;
        // go through data and add complexity to relative week
        for ( i = 0; i < maxLength; i++ )
        {
            if( this.activeDataSet.scrumDataArray[ i ].isFinished )
            {
                var d = new Date ( this.activeDataSet.scrumDataArray[ i ].finishDate ); 
                relativeWeek = this.GetRelativeWeek( baseDate, d ) + 1;
                if( result[ relativeWeek ] == undefined )
                {
                    result[ relativeWeek ] = parseInt( this.activeDataSet.scrumDataArray[ i ].complexity );
                }
                else
                {
                    result[ relativeWeek ] += parseInt( this.activeDataSet.scrumDataArray[ i ].complexity );
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
            nameArray[ i ] = this.GetRelativeWeekName( baseDate, i-1 );
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
       var maxLength = this.activeDataSet.scrumDataArray.length;
       for ( var i = 0; i < maxLength; i++ )
       {
           if( undefined != this.activeDataSet.scrumDataArray[ i ].complexity )
           {
              result.sum += parseInt( this.activeDataSet.scrumDataArray[ i ].complexity );
              if( this.activeDataSet.scrumDataArray[ i ].isFinished )
              {
                  if( this.activeDataSet.scrumDataArray[ i ].finishDate != undefined )
                  {
                      var d;
                      if( typeof this.activeDataSet.scrumDataArray[ i ].finishDate == 'string' )
                      {
                          d = new Date( this.activeDataSet.scrumDataArray[ i ].finishDate );
                      }
                      else
                      {
                          d = this.activeDataSet.scrumDataArray[ i ].finishDate;
                      }
                      if( d < result.oldestDate )
                      {
                          result.oldestDate = d;
                      }
                  }
              }
           }
       }
       console.log( "Sum:" + result.sum + ", oldestDate: " + result.oldestDate );
       return result;
    },
	PriorityListLength: function () {
		var currentData = this.activeDataSet.scrumDataArray[ this.activeDataSet.priorityStartId ];
		var count = 0;
		while( currentData.nextPriorityId != -1 && count < this.activeDataSet.scrumDataArray.length )
		{
			currentData = this.activeDataSet.scrumDataArray[ currentData.nextPriorityId ];
			count++;
		}
		return count + 1;
    },
	MovePriorityUp: function ( dataToBeMovedUp ) {
		if( this.activeDataSet.scrumDataArray[ dataToBeMovedUp ].previousPriorityId != -1 )
			// cannot be moved if first element
		{
			// get all involved ids
			var dataToBeMovedDown  = this.activeDataSet.scrumDataArray[ dataToBeMovedUp ].previousPriorityId;
			var precedingElementId = this.activeDataSet.scrumDataArray[ dataToBeMovedDown ].previousPriorityId
			var followingElementId = this.activeDataSet.scrumDataArray[ dataToBeMovedUp ].nextPriorityId;
			// change order of elements
			this.activeDataSet.scrumDataArray[ dataToBeMovedDown ].previousPriorityId = dataToBeMovedUp;
			this.activeDataSet.scrumDataArray[ dataToBeMovedUp ].nextPriorityId       = dataToBeMovedDown;
			this.activeDataSet.scrumDataArray[ dataToBeMovedUp ].previousPriorityId   = precedingElementId;
			this.activeDataSet.scrumDataArray[ dataToBeMovedDown ].nextPriorityId     = followingElementId;
			// change order outer elements
			if( precedingElementId != -1 )
			{
				this.activeDataSet.scrumDataArray[ precedingElementId ].nextPriorityId = dataToBeMovedUp;
			}
			if( followingElementId != -1 )
			{
				this.activeDataSet.scrumDataArray[ followingElementId ].previousPriorityId = dataToBeMovedDown;
			}
			// new first element
			if( this.activeDataSet.scrumDataArray[ dataToBeMovedUp ].previousPriorityId == -1 ) 
			{
				this.activeDataSet.priorityStartId = dataToBeMovedUp;
			}
			this.activeDataSet.dirtyFlag = true;
			this.activeDataSet.versionCounter++;
			return true;
		}
		else
		{
			return false;
		}
    },
	IsIntegrityOk: function () {
		// check ids are existing exactly once
		for( i = 0; i < this.activeDataSet.scrumDataArray.length; i++ )
		{
			if( this.activeDataSet.scrumDataArray[ i ].id != i )
			{
				return false;
			}
		}
		// check priority list is ok
		var currentData = this.activeDataSet.scrumDataArray[ this.activeDataSet.priorityStartId ];
		if( currentData.previousPriorityId != -1 )
		{
			console.log( "scrumDataManager.IsIntegrityOk: Initial priority field " 
				+ currentData.id + " has previous element" );
			return false;
		}
		var count = 0;
		while( currentData.nextPriorityId != -1 && count < this.activeDataSet.scrumDataArray.length )
		{
			nextData = this.activeDataSet.scrumDataArray[ currentData.nextPriorityId ];
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
		if( count >= this.activeDataSet.scrumDataArray.length )
		{
			console.log( "scrumDataManager.IsIntegrityOk: Too many elements in priority list" );
			return false;
		}
		return true;
	}
}
scrumDataManager.InitEmptyDataSet();

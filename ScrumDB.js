
var fs = require( 'fs' );

this.scrumDataManagerList = new Array();

this.GetData = function( name )
{
   return scrumDataManager; 
}

this.LoadScrumDataSync = function( name )
{
    try
    {
         var preparsedData = fs.readFileSync( "data/" + name + ".json", 'utf8' ); 
    } catch( e )
    {
     	 var data= {};
	 data.priorityStartId = -1;
	 data.lastFinishedId = -1;
	 data.scrumDataArray = new Array();
	 return data;
    }
    if( preparsedData.length == 0 )
    {
    console.log( "ScrumDB::LoadScrumDataSync: Could not open file." );
	var data= {};
	data.priorityStartId = -1;
	data.lastFinishedId = -1;
	data.scrumDataArray = new Array();
	return data;
    }
    return JSON.parse( preparsedData );
}

this.SaveScrumDataAsync = function( name, scrumDataArray, priorityStartId,
                                    lastFinishedId, callback )
{
    fs.mkdir( "data", function(exists) {} );
    var data = {};
    data.priorityStartId = priorityStartId;
    data.lastFinishedId  = lastFinishedId;
    data.scrumDataArray  = scrumDataArray;
    fs.writeFile( "data/" + name + ".json", JSON.stringify( data, null, ' ' ), callback ); 
}


this.TimerCallback = function()
{
    for( var i = 0; i < this.scrumDataManagerList.length; i++ )
    {
        if( this.scrumDataManagerList[ i ].IsDirty() )
	{
	    this.SaveScrumDataAsync( this.scrumDataManagerList[ i ].name,
			    this.scrumDataArray,
			    this.scrumDataManagerList[ i ].priorityStartId,
                this.scrumDataManagerList[ i ].lastFinishedId, 
                null );
	}
    }
}
this.timerHandle = setInterval( (function( self ){
    return function() {
        self.TimerCallback();
    }
    })(this),60 * 1000 );

this.AddDataManager = function( scrumDataManager )
{
    this.scrumDataManagerList.push( scrumDataManager );
    this.TimerCallback();
}


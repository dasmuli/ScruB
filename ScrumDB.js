
var fs = require( 'fs' );

this.scrumDataManagerList = new Array();

this.scrumDataArray;
this.parsedObject = {};

this.LoadScrumDataSync = function( name )
{
    var preparsedData = fs.readFileSync( "data/" + name + ".json", 'utf8'); 
    if( preparsedData.length == 0 )
    {
        console.log( "ScrumDB::LoadScrumDataSync: Could not open file." );
	var data= {};
	data.priorityStartId = -1;
	data.lastFinishedId = -1;
	data.scrumDataArray = new Array();
	return data;
    }
    console.log( "Loaded data:" + preparsedData );
    this.parsedObject = JSON.parse( preparsedData );
    this.CheckForMissingAttributes(); 
    console.log( "Returing " + JSON.stringify( this.parsedObject, null, ' ' ) );
    return this.parsedObject;
}

this.CheckForMissingAttributes = function()
{
   if( !( 'priorityStartId' in this.parsedObject ) )
   {
	   console.log( "adding prop" );
       this.parsedObject[ 'priorityStartId' ] = -1;
   }
}

this.SaveScrumDataAsync = function( name, scrumDataArray, priorityStartId, callback )
{
    fs.mkdir( "data", function(exists) {} );
    var data = {};
    data.priorityStartId = priorityStartId;
    data.scrumDataArray = scrumDataArray;
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
			    this.scrumDataManagerList[ i ].priorityStartId, null );
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


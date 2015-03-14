
var fs = require( 'fs' );

this.scrumDataSetList =  {};

this.GetData = function( name )
{
   return this.scrumDataSetList[ name ]; 
}

this.LoadScrumDataSync = function( name )
{
    try
    {
         var preparsedData = fs.readFileSync( "data/" + name + ".json", 'utf8' ); 
    } catch( e )
    {
     	 var data= {};
         data.name = name;
	     data.priorityStartId = -1;
	     data.lastFinishedId = -1;
	     data.scrumDataArray = new Array();
	     return data;
    }
    if( preparsedData.length == 0 )
    {
         console.log( "ScrumDB::LoadScrumDataSync: Could not open file." );
	     var data= {};
         data.name = name;
	     data.priorityStartId = -1;
	     data.lastFinishedId = -1;
	     data.scrumDataArray = new Array();
	     return data;
    }
    return JSON.parse( preparsedData );
}

this.Init = function()
{
    this.datasets = {};
    this.datasets.Default = this.LoadScrumDataSync( 'Default' );
}
this.Init();

this.SaveScrumDataAsync = function( name, scrumDataArray, priorityStartId,
                                    lastFinishedId, callback )
{
    fs.mkdir( "data", function(exists) {} );
    var data = {};
    data.name = name;
    data.priorityStartId = priorityStartId;
    data.lastFinishedId  = lastFinishedId;
    data.scrumDataArray  = scrumDataArray;
    fs.writeFile( "data/" + name + ".json", JSON.stringify( data, null, ' ' ), callback ); 
}


this.TimerCallback = function()
{
    for( var dataSet in this.scrumDataSetList )
    {
        if( this.scrumDataSetList.hasOwnProperty( dataSet ) )
	    {
	        this.SaveScrumDataAsync( dataSet.name,
			    dataSet.scrumDataArray,
			    dataSet.priorityStartId,
                dataSet.lastFinishedId, 
                null );
	    }
    }
}
this.timerHandle = setInterval( (function( self ){
    return function() {
        self.TimerCallback();
    }
    })(this),60 * 1000 );

this.AddDataManager = function( scrumDataSet )
{
    if( this.scrumDataSetList[ scrumDataSet.name ] == undefined )
    {
        this.scrumDataSetList[ scrumDataSet.name ] = scrumDataSet;
        this.TimerCallback();
        return true;
    }
    else
    {
        return false;
    }
}

this.DeleteData = function( name )
{
    delete this.scrumDataSetList[ name ];
}

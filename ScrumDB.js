
var fs = require( 'fs' );

this.scrumDataSetList = new Array();

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
    for( var i = 0; i < this.scrumDataSetList.length; i++ )
    {
        if( this.scrumDataSetList[ i ].dirtyFlag )
	    {
	        this.SaveScrumDataAsync( this.scrumDataSetList[ i ].name,
			    this.scrumDataSetList[ i ].scrumDataArray,
			    this.scrumDataSetList[ i ].priorityStartId,
                this.scrumDataSetList[ i ].lastFinishedId, 
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
    this.scrumDataSetList.push( scrumDataSet );
    this.TimerCallback();
}


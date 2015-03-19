
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
    var result = JSON.parse( preparsedData );
    result.dirtyFlag = false;
    return result;
}


this.LoadData = function( name )
{
    if( this.scrumDataSetList[ name ] != undefined )
    {
        return true;
    }
    try
    {
        var data = JSON.parse( fs.readFileSync( "data/" + name + ".json", 'utf8' ) ); 
        this.AddDataSet( data );
        return true;
    }
    catch( e )
    {
        return false;
    }
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
    for( var dataSetName in this.scrumDataSetList )
    {
        if( this.scrumDataSetList.hasOwnProperty( dataSetName ) )
	    {
            var dataSet = this.scrumDataSetList[ dataSetName ]
            if( dataSet.dirtyFlag )
            {
	           this.SaveScrumDataAsync( dataSet.name,
			    dataSet.scrumDataArray,
			    dataSet.priorityStartId,
                dataSet.lastFinishedId, 
                function( err ) { console.log( err ); } );
               dataSet.dirtyFlag = false;
            }
	    }
    }
}
this.timerHandle = setInterval( (function( self ){
    return function() {
        self.TimerCallback();
    }
    })(this),60 * 1000 );

this.AddDataSet = function( scrumDataSet )
{
    if( this.scrumDataSetList[ scrumDataSet.name ] == undefined )
    {
        this.scrumDataSetList[ scrumDataSet.name ] = scrumDataSet;
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


var fs = require( 'fs' );

this.scrumDataManagerList = new Array();

this.scrumDataArray;

this.LoadScrumDataSync = function( name )
{
    return JSON.parse( fs.readFileSync( "data/" + name + ".json", 'utf8') );
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


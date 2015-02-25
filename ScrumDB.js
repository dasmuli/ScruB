
var fs = require( 'fs' );
var vm = require( 'vm' );

this.scrumDataManagerList = new Array();

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
            console.log( "ScrumDB: dirty enough." );
	    SaveScrumDataAsync( this.scrumDataArray[ i ].name,
			    this.scrumDataArray[ i ],
			    this.scrumDataManager[ i ].priorityStartId, null );
	}
    }
}
this.timerHandle = setInterval( this.TimerCallback, 60 * 1000 );

this.AddDataManager = function( scrumDataManager )
{
    this.scrumDataManagerList.push( scrumDataManager );
    this.TimerCallback();
}


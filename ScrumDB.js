
var fs = require( 'fs' );

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
	//console.log( "ScrumDB timer" );
}
this.timerHandle = setInterval( this.TimerCallback, 60 * 1000 );

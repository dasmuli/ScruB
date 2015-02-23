
var fs = require( 'fs' );

this.LoadScrumDataSync = function( name )
{
    return JSON.parse( fs.readFileSync( "data/" + name + ".json", 'utf8') );
}

this.SaveScrumDataSync = function( name, scrumDataArray, priorityStartId )
{
    fs.mkdir( "data", function(exists) {} );
    var data = {};
    data.priorityStartId = priorityStartId;
    data.scrumDataArray = scrumDataArray;
    fs.writeFileSync( "data/" + name + ".json", JSON.stringify( data, null, ' ' ) ); 
}

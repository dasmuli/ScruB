

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////   Variables   ///////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var scrumDataIdInEditor = 0;
var socket;



////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////   UI  functions   /////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function SwapListElements( upperElementId, lowerElementId )
{
	$( "#scrumListId"+upperElementId ).insertAfter( ($ ( "#scrumListId"+lowerElementId ) ) );
	$( "#editLink"+lowerElementId )
		.animate({height: '+=20px'}, "fast")
		.animate({height: '-=20px'}, "fast");
	$( "#editLink"+upperElementId )
		.animate({height: '-=20px'}, "fast")
		.animate({height: '+=20px'}, "fast");

}

function CreateDataListEntry( scrumdata )
{
	$("#scrumDataList").append("<li id=\"scrumListId"
			+scrumdata.id
			+"\"><a href=\"#purchase\" id=\"editLink"
			+scrumdata.id
			+"\" data-rel=\"popup\" data-position-to=\"window\" data-transition=\"pop\">"
			+scrumdata.featurename
			+"</a><a href=\"#\" id=\"moveDataUp"
			+scrumdata.id
			+"\">Edit</a></li>");
	if ($("#scrumDataList").hasClass('ui-listview')) 
	{
		$("#scrumDataList").listview('refresh'); //this listview has already been initialized, so refresh it
	}
	$( "#editLink"+scrumdata.priority ).click(function() {
		scrumDataIdInEditor = scrumdata.priority;
	});	
	$( "#moveDataUp"+scrumdata.id ).click(function() {
		socket.emit('moveDataUp', {
			id			: scrumdata.id
			});
	});	
}


function UpdateBacklogData( scrumdata )
{
	console.log( "UpdateBacklogData for " + scrumdata.id + ", prio: " + scrumdata.priority );
	// try to find elementFromPoint
	if( scrumDataArray[ scrumdata.priority ] )
	{
		scrumDataArray[ scrumdata.priority ] = scrumdata;
	}
	if( $( "#editLink"+scrumdata.priority ).length != 0 )
	{
		$( "#editLink"+scrumdata.id ).html( scrumdata.featurename );
	}
	else // if not found: add
	{	
		CreateDataListEntry( scrumdata );
	}
}




////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////   UI events   ///////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

$( document ).on( "pagecontainershow", function( event, ui ) {
    if (ui.toPage.prop("id") == "mainPage")
	{
		var randomScalingFactor;
		var lineChartData;
		var ctx;
		if( !window.myLine )
		{
			randomScalingFactor = function(){ return Math.round(Math.random()*100)};
			lineChartData = {
				labels : ["January","February","March","April","May","June","July"],
				datasets : [
					{
						label: "My First dataset",
						fillColor : "rgba(220,220,220,0.2)",
						strokeColor : "rgba(220,220,220,1)",
						pointColor : "rgba(220,220,220,1)",
						pointStrokeColor : "#fff",
						pointHighlightFill : "#fff",
						pointHighlightStroke : "rgba(220,220,220,1)",
						data : [randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor()]
					},
					{
						label: "My Second dataset",
						fillColor : "rgba(151,187,205,0.2)",
						strokeColor : "rgba(151,187,205,1)",
						pointColor : "rgba(151,187,205,1)",
						pointStrokeColor : "#fff",
						pointHighlightFill : "#fff",
						pointHighlightStroke : "rgba(151,187,205,1)",
						data : [randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor()]
					}
				]
			}
			ctx = document.getElementById("canvas").getContext("2d");
		
			window.myLine = new Chart(ctx).Line(lineChartData, {
				responsive: true,
				maintainAspectRatio: false
				});
		}
		else
		{
			//console.log( "chart redraw" );
			//window.myLine.resize()
		}
		console.log( "ctx!" );
    }
	console.log( "pagecontainershow" );
});

$(document).on("pageinit", "#dataPage", function()
{
	console.log( "pageinit" );
    $("#purchase").on("popupbeforeposition", function(event, ui) { // othre event is: popupafteropen
        console.log( "popupbeforeposition: " + scrumDataIdInEditor );
	$("#textinputName").val( scrumDataArray[ scrumDataIdInEditor ].featurename );
    });
	$( "#editorOkButton" ).click(function() {
		scrumDataArray[ scrumDataIdInEditor ].featurename = $("#textinputName").val();
		SendUpdateOfScrumDataToServer();
	});	
});




////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////   Network functions   ////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function SendUpdateOfScrumDataToServer()
{
	socket.emit('updateScrumData', {
		id			: scrumDataIdInEditor,
		featurename	: scrumDataArray[ scrumDataIdInEditor ].featurename });
}




////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////   Network events   /////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

$( document ).ready(function() {
	// initiate WebSocket
    socket = io.connect();
	
    // update non-order related data
    socket.on('scrubdata', function (data) {
		console.log( "received scrubdata: " + data.featurename );
		scrumDataArray[ data.priority ] = data;
		UpdateBacklogData( data );
    });
	
	socket.on('scrubmoveup', function ( lowerElementId ) {
		console.log( "scrubmoveup: " + lowerElementId );
		var upperElementId = scrumDataArray[ lowerElementId ].previousPriorityId;
		scrumDataManager.MovePriorityUp( lowerElementId );
		if( upperElementId != -1 )
		{
			SwapListElements( upperElementId, lowerElementId );
		}
	});

	// complete scrum data array
	socket.on('scrubfulldata', function ( data ) {
		scrumDataArray = data.dataArray.slice();
		scrumDataManager.priorityStartId = data.priorityStartId;
		console.log( "scrubdata changed, length:" + scrumDataArray.length );
		var prioId = scrumDataManager.priorityStartId;
		while( prioId != -1 )
		{
			CreateDataListEntry( scrumDataArray[ prioId ] );
			prioId = scrumDataArray[ prioId ].nextPriorityId;
		}
    });
    // Nachricht senden
    function senden(){
        // Eingabefelder auslesen
        var name = $('#name').val();
        var text = $('#text').val();
        // Socket senden
        socket.emit('chat', { name: name, text: text });
        // Text-Eingabe leeren
        $('#text').val('');
    }
    // bei einem Klick
    $('#senden').click(senden);
    // oder mit der Enter-Taste
    $('#text').keypress(function (e) {
        if (e.which == 13) {
            senden();
        }
    });
	console.log( "socket ready!" );
});
console.log( "Init done!" );

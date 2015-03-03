

//////////////////////////   Variables   ///////////////////////////////////////////////////

var scrumDataIdInEditor = 0;
var socket;



///////////////////////   UI  functions   /////////////////////////////////////////////////

function SwapListElements( upperElementId, lowerElementId )
{
	$( "#scrumListId"+upperElementId ).insertAfter( ($ ( "#scrumListId"+lowerElementId ) ) );
}

function CreateDataListEntry( scrumdata )
{
	$("#scrumDataList").append("<li id=\"scrumListId"
			+scrumdata.id
			+"\"><a href=\"#editData\" id=\"editLink"
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
	$( "#editLink"+scrumdata.id ).click(function() {
		scrumDataIdInEditor = scrumdata.id;
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
	if( scrumDataManager.scrumDataArray[ scrumdata.id ] )
	{
		scrumDataManager.scrumDataArray[ scrumdata.id ] = scrumdata;
	}
	if( $( "#editLink"+scrumdata.id ).length != 0 )
	{
		$( "#editLink"+scrumdata.id ).html( scrumdata.featurename );
	}
	else // if not found: add
	{	
		CreateDataListEntry( scrumdata );
	}
}

function AddDataDataFrontList( scrumData )
{
	console.log( "Adding data: " + scrumData.id + ", prio: " + scrumData.priority );
	CreateDataListEntry( scrumData );
    if( scrumData.nextPriorityId != -1 )
    {
	    $( "#scrumListId"+scrumData.id ).insertBefore( ($ ( "#scrumListId"+scrumData.nextPriorityId ) ) );
    }
}




//////////////////////////////   UI events   ///////////////////////////////////////////////////

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
    $("#editData").on("popupbeforeposition", function(event, ui) { // othre event is: popupafteropen
        console.log( "popupbeforeposition: " + scrumDataIdInEditor );
	$("#textinputName").val( scrumDataManager.scrumDataArray[ scrumDataIdInEditor ].featurename );
    });
	$( "#editorOkButton" ).click(function() {
		scrumDataManager.scrumDataArray[ scrumDataIdInEditor ].featurename = $("#textinputName").val();
		SendUpdateOfScrumDataToServer();
	});	
    $( "#editorAddOkButton" ).click(function() {
        console.log( "Add button clicked." );
		var name        = $("#textinputNameAdd").val();
		var complexity  = $("#selectComplexityAddPopup").val();
		var description = $("#descriptionAreaAddPopup").val();
		SendAddDataToServer( name, complexity, description);
	});	
});




/////////////////////   Network functions   ////////////////////////////////////////////////

function SendUpdateOfScrumDataToServer()
{
	socket.emit('updateScrumData', {
		id			: scrumDataIdInEditor,
		featurename	: scrumDataManager.scrumDataArray[ scrumDataIdInEditor ].featurename });
}

function SendAddDataToServer( name, _complexity, _description )
{
    var data = new scrumDataManager.DataObject( -1 );
    data.featurename = name;
    data.complexity  = _complexity;
    data.description = _description;
	socket.emit( scrumDataManager.commandToServer.ADD_DATA_TO_FRONT, data );
}


/////////////////////   Network events   /////////////////////////////////////////////////

$( document ).ready(function() {
	// initiate WebSocket
    socket = io.connect();
	
    socket.on( scrumDataManager.commandToClient.ADD_DATA_TO_FRONT, function ( data ) {
		console.log( "received add data: " + data.featurename );
		scrumDataManager.AddDataToFront( data );
		AddDataDataFrontList( data );
    });

    // update non-order related data
    socket.on('scrubdata', function (data) {
		console.log( "received scrubdata: " + data.featurename );
		scrumDataManager.scrumDataArray[ data.id ] = data;
		UpdateBacklogData( data );
    });
	
	socket.on('scrubmoveup', function ( lowerElementId ) {
		console.log( "received scrubmoveup: " + lowerElementId );
		var upperElementId = scrumDataManager.scrumDataArray[ lowerElementId ].previousPriorityId;
		scrumDataManager.MovePriorityUp( lowerElementId );
		if( upperElementId != -1 )
		{
			SwapListElements( upperElementId, lowerElementId );
		}
	});

	// complete scrum data array
	socket.on('scrubfulldata', function ( data ) {
		$("#scrumDataList").empty();
		scrumDataManager.scrumDataArray = data.dataArray.slice();
		scrumDataManager.priorityStartId = data.priorityStartId;
		console.log( "scrubdata changed, length:" 
			    + scrumDataManager.scrumDataArray.length );
		var prioId = scrumDataManager.priorityStartId;
		while( prioId != -1 )
		{
			CreateDataListEntry( scrumDataManager.scrumDataArray[ prioId ] );
			prioId = scrumDataManager.scrumDataArray[ prioId ].nextPriorityId;
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

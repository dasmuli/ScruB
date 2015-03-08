

//////////////////////////   Variables   ///////////////////////////////////////////////////

var scrumDataIdInEditor = 0;
var scrumDataIdInDoneEditor = 0;
var socket;



///////////////////////   UI  functions   /////////////////////////////////////////////////

function SwapListElements( upperElementId, lowerElementId )
{
	$( "#scrumListId"+upperElementId ).insertAfter( ($ ( "#scrumListId"+lowerElementId ) ) );
}

function CreateDataListEntry( list, scrumdata, addEditFeats )
{
    if( addEditFeats )
    {
	    $( list ).append("<li id=\"scrumListId"
			+scrumdata.id
			+"\"><a href=\"#editData\" id=\"editLink"
			+scrumdata.id
			+"\" data-rel=\"popup\" data-position-to=\"window\" data-transition=\"pop\">"
			+scrumdata.featurename
			+"</a><a href=\"#\" id=\"moveDataUp"
			+scrumdata.id
			+"\">Edit</a></li>");
    }
    else
    {
        $( list ).append("<li id=\"scrumListId"
			+scrumdata.id
			+"\">"
            +"<a href=\"#editDoneData\" id=\"editLink"
			+scrumdata.id
			+"\" data-rel=\"popup\" data-position-to=\"window\" data-transition=\"pop\">"
            + scrumdata.featurename
			+"</li>");

    }
	if ($( list ).hasClass('ui-listview')) 
	{
		$( list ).listview('refresh'); //this listview has already been initialized, so refresh it
	}
    if( addEditFeats )
    {
	    $( "#editLink"+scrumdata.id ).click(function() {
		    scrumDataIdInEditor = scrumdata.id;
	    });	
	    $( "#moveDataUp"+scrumdata.id ).click(function() {
		    socket.emit('moveDataUp', {
			    id			: scrumdata.id
		    	});
	    });
    }  
    else
    {
	    $( "#editLink"+scrumdata.id ).click(function() {
		    scrumDataIdInDoneEditor = scrumdata.id;
	    });	
    }    
}


function UpdateBacklogData( scrumdata )
{
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
		CreateDataListEntry( '#scrumDataList', scrumdata, true );
	}
}

function AddDataDataFrontList( scrumData )
{
	console.log( "Adding data: " + scrumData.id + ", prio: " + scrumData.priority );
	CreateDataListEntry( '#scrumDataList', scrumData, true );
    if( scrumData.nextPriorityId != -1 )
    {
	    $( "#scrumListId"+scrumData.id ).insertBefore( ($ ( "#scrumListId"+scrumData.nextPriorityId ) ) );
    }
}

function RefreshList( list )
{
	if ($( list ).hasClass('ui-listview')) 
    {
        $( list ).listview('refresh');
    }
}


function SetDoneListForElement( data, toDoneList )
{
	console.log( "Moving: " + data.id + " to list done list: " + toDoneList );
    $( "#scrumListId"+data.id ).remove();
    //$( "#scrumDoneList" ).prepend( ($ ( "#scrumListId"+data.id ) ) );
    if( toDoneList )
    {
        CreateDataListEntry( '#scrumDoneList', data, false );
    }
    else
    {
        CreateDataListEntry( '#scrumDataList', data, true );
    }
    if( data.nextPriorityId != -1 )
    {
        $( "#scrumListId"+data.id ).insertBefore(
            ($ ( "#scrumListId"+data.nextPriorityId ) ) );
    }
    RefreshList( '#scrumDataList' );       
    RefreshList( '#scrumDoneList' );
}

function SetHeaderText( text )
{
     $( '#titleHeaderMainPage' ).text( text );
     $( '#titleHeaderDataPage' ).text( text );
     $( '#titleHeaderDonePage' ).text( text );
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


$(document).on("pageinit", "#donePage", function()
{
    $("#editDoneData").on("popupbeforeposition", function(event, ui) { 
		$( "#flipDoneFinished" ).prop( 'checked', false ).flipswitch( 'refresh' );
	    $("#textdoneinputName").val( 
          scrumDataManager.scrumDataArray[ scrumDataIdInDoneEditor ].featurename );
		$("#selectDoneComplexityEditPopup").val(
          scrumDataManager.scrumDataArray[ scrumDataIdInDoneEditor ].complexity )
                .selectmenu( "refresh", true );
		$("#descriptionDoneAreaEditPopup").val(
         scrumDataManager.scrumDataArray[ scrumDataIdInDoneEditor ].description );
        });
	    $( "#editorDoneOkButton" ).click(function() {
          if( !$( "#flipDoneFinished" ).is( ':checked' ) )
          {
            scrumDataManager.scrumDataArray[ scrumDataIdInDoneEditor ]
                    .featurename = $("#textdoneinputName").val();
            scrumDataManager.scrumDataArray[ scrumDataIdInDoneEditor ]
                    .complexity  = $("#selectDoneComplexityEditPopup").val();
            scrumDataManager.scrumDataArray[ scrumDataIdInDoneEditor ]
                    .description = $("#descriptionDoneAreaEditPopup").val();
     		SendUpdateOfScrumDataToServer( scrumDataIdInDoneEditor );
          }
          else
          {
            SendReopenToServer();
          }
	});	
});


$(document).on("pageinit", "#dataPage", function()
{
	console.log( "pageinit" );
    // other event is: popupafteropen
    $("#editData").on("popupbeforeposition", function(event, ui) { 
        console.log( "popupbeforeposition: " + scrumDataIdInEditor );
		$( "#flipFinished" ).prop( 'checked', true ).flipswitch( 'refresh' );
	    $("#textinputName").val( 
          scrumDataManager.scrumDataArray[ scrumDataIdInEditor ].featurename );
		$("#selectComplexityEditPopup").val(
          scrumDataManager.scrumDataArray[ scrumDataIdInEditor ].complexity )
                .selectmenu( "refresh", true );
		$("#descriptionAreaEditPopup").val(
         scrumDataManager.scrumDataArray[ scrumDataIdInEditor ].description );
        });
	    $( "#editorOkButton" ).click(function() {
          if( $( "#flipFinished" ).is( ':checked' ) )
          {
            scrumDataManager.scrumDataArray[ scrumDataIdInEditor ].featurename = 
               $("#textinputName").val();
            scrumDataManager.scrumDataArray[ scrumDataIdInEditor ].complexity = 
               $("#selectComplexityEditPopup").val();
            scrumDataManager.scrumDataArray[ scrumDataIdInEditor ].description = 
               $("#descriptionAreaEditPopup").val();
     		SendUpdateOfScrumDataToServer( scrumDateIdInEditor );
          }
          else
          {
           SendDoneToServer();
          }
	});	
    $("#addData").on("popupbeforeposition", function(event, ui) { 
        console.log( "popupbeforeposition addData " );
	    $("#textinputNameAdd").val( '' );
	    $("#selectComplexityAddPopup").val( '1' ).selectmenu( "refresh", true );
	    $("#descriptionAreaAddPopup").val( '' );
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

function SendUpdateOfScrumDataToServer( id )
{
    console.log( "Sending update: " 
                 + JSON.stringify( scrumDataManager.scrumDataArray[ id ] ) );
	socket.emit(scrumDataManager.commandToServer.UPDATE_DATA, 
                scrumDataManager.scrumDataArray[ id ] );
}

function SendDoneToServer()
{
	socket.emit( scrumDataManager.commandToServer.FINISH,
                 scrumDataManager.scrumDataArray[ scrumDataIdInEditor ] );
}

function SendReopenToServer()
{
	socket.emit( scrumDataManager.commandToServer.REOPEN,
                 scrumDataManager.scrumDataArray[ scrumDataIdInDoneEditor ] );
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

    socket.on( 'connect', function() {
     console.log( "Socket connected" );
     SetHeaderText( 'ScruB' );
    });
    
    socket.on( 'error', function( err ) {
     console.log( "Socket error: " + err );
    });

    socket.on( 'disconnect', function() {
     console.log( "Socket disconnected" );
     SetHeaderText( 'ScruB - Offline' );
    });

    socket.on( 'reconnecting', function( number ) {
     console.log( "Socket reconnection attempt " + number );
    });

	
    socket.on( scrumDataManager.commandToClient.FINISH, function ( data ) {
		console.log( "received finish data: " + data.featurename );
        scrumDataManager.UpdateData( data );
        scrumDataManager.SetDoneState( data.id, true );
		SetDoneListForElement( data, true );
    });

    socket.on( scrumDataManager.commandToClient.REOPEN, function ( data )
    {
		console.log( "received reopen data: " + data.featurename );
        scrumDataManager.UpdateData( data );
        scrumDataManager.SetDoneState( data.id, false );
		SetDoneListForElement( data, false );
    });


    socket.on( scrumDataManager.commandToClient.ADD_DATA_TO_FRONT, function ( data )
    {
		console.log( "received add data: " + data.featurename );
		scrumDataManager.AddDataToFront( data );
		AddDataDataFrontList( data );
    });

    // update non-order related data
    socket.on( scrumDataManager.commandToClient.UPDATE_DATA, function (data) {
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
        $( '#scrumDataList' ).listview('refresh');
	});


	// complete scrum data array
	socket.on('scrubfulldata', function ( data ) {
		$("#scrumDataList").empty();
		$("#scrumDoneList").empty();
		scrumDataManager.scrumDataArray  = data.dataArray.slice();
		scrumDataManager.priorityStartId = data.priorityStartId;
		scrumDataManager.lastFinishedId  = data.lastFinishedId;
		console.log( "full scrubdata received, length:" 
			    + scrumDataManager.scrumDataArray.length );
		var prioId = scrumDataManager.priorityStartId;
		while( prioId != -1 )
		{
			CreateDataListEntry( '#scrumDataList',
                                 scrumDataManager.scrumDataArray[ prioId ], true );
			prioId = scrumDataManager.scrumDataArray[ prioId ].nextPriorityId;
		}
        prioId = scrumDataManager.lastFinishedId;
        console.log( "Creating done list with id: " + prioId );
		while( prioId != undefined &&  prioId != -1 )
		{
			CreateDataListEntry( '#scrumDoneList'
                                 ,scrumDataManager.scrumDataArray[ prioId ], false );
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

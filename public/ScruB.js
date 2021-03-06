

//////////////////////////   Variables   ///////////////////////////////////////////////////

var scrumDataIdInEditor = 0;
var scrumDataIdInDoneEditor = 0;
var socket;



///////////////////////   UI  functions   /////////////////////////////////////////////////


function ComputeChartData()
{
    var chartData = scrumDataManager.GetWeekBasedChartData();
    console.log( "Setting new chart data: " + JSON.stringify( chartData ) );
    if( $( '#canvas' ).width() <= 100 )
    {
        console.log( "Chart canvas too small." );
    }
    else
    {
      console.log( "Chart canvas width " + $( '#canvas' ).width() );
      if( window.myLine == undefined )
      {
        lineChartData = {
				labels : chartData.labelArray,
				datasets : [
					{
						label: "Burndown chart",
                        fillColor : "rgba(151,187,205,0.2)",
						strokeColor : "rgba(151,187,205,1)",
						pointColor : "rgba(151,187,205,1)",
						pointStrokeColor : "#fff",
						pointHighlightFill : "#fff",
						pointHighlightStroke : "rgba(151,187,205,1)",
						data : chartData.dataArray
                    }
				]
			}
        ctx = document.getElementById("canvas").getContext("2d");	
	    window.myLine = new Chart(ctx).Line(lineChartData, {
		    responsive: true,
 	        maintainAspectRatio: false,
            bezierCurve: false,
            scaleBeginAtZero: true
	    });
      } // window.myLine undefined
      else
      {
          var i;
          var dataLength = chartData.dataArray.length;
          if( window.myLine.datasets[ 0 ].points.length ==
              chartData.dataArray.length )
          {
              for( i = 0; i < dataLength; i++ )
              {
                  window.myLine.datasets[ 0 ].points[ i ].value =
                         chartData.dataArray[ i ];
              }
              window.myLine.update();
          }
          else
          {
              while( window.myLine.datasets[0].points.length > 0 )
              {
                  window.myLine.removeData();
              }
              for( i = 0; i < dataLength; i++ )
              {
                  window.myLine.addData( [ chartData.dataArray[ i ] ], chartData.labelArray[ i ] );
              }
          }
      }
    }

}

function UpdateProjectInformation()
{
    if( scrumDataManager.activeDataSet.name )
    {
        $( '#ProjectName' ).text( scrumDataManager.activeDataSet.name );
    }
    if( scrumDataManager.activeDataSet.scrumDataArray )
    {
        $( '#ProjectNumberOfTasks' ).text( scrumDataManager.activeDataSet.scrumDataArray.length );
    }
    var projectInfo = scrumDataManager.GetProjectInformation();
    $( '#ProjectTasksOpen' ).text( projectInfo.tasksOpen );
    $( '#ProjectTasksDone' ).text( projectInfo.tasksDone );
    $( '#ProjectVelocity' ).text( projectInfo.velocity );
    $( '#ProjectConnectedDevices' ).text( scrumDataManager.activeDataSet.connectedDevices );
}

function StartIntegrityCheckTimeout()
{
    window.setTimeout( CheckScrumListIntegrity, 500 ); // check once after 500ms if list is ok
}

function CheckScrumListIntegrity()
{
    console.log( "Checking list integrity" );
    var prioId = scrumDataManager.activeDataSet.priorityStartId;
    var current;
    var next;
	while( prioId != -1 )
	{
		current = $( '#scrumListId'+prioId );
        var nextId = scrumDataManager.activeDataSet.scrumDataArray[ prioId ].nextPriorityId
        if( current.length ) // length checks, if elements exists 
        {
             if( nextId != -1 )
             {
                 next = $( '#scrumListId' + nextId );
                 if( next.length )
                 {
                     if( !next.is( current.next() ) )
                     {
                         console.log( "List integrity: wrong order: " + nextId 
                                      + " must be follwing " + prioId );
	                     next.insertAfter( current );
                     }
                 }
                 else // add a new list element
                 {
                     console.log( "List integrity: missing element: " + nextId );
                     CreateDataListEntry( "#scrumDataList",
                         scrumDataManager.activeDataSet.scrumDataArray[ nextId ], true );
                     next = $( '#scrumListId' + nextId );
	                 next.insertAfter( current );
                 }
            }
        }
		prioId = scrumDataManager.activeDataSet.scrumDataArray[ prioId ].nextPriorityId;
	}

}


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
    scrumDataManager.UpdateData( scrumdata );
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


$(document).on("pageshow", "#mainPage", function()
{
    console.log( "Showing main page" );
    ComputeChartData();
});

$(document).on("pageinit", "#projectPage", function()
{
	    $( "#CreateProjectButton" ).click(function() {
             SendCreateAnonymousProject();
          });	
});


$(document).on("pageinit", "#donePage", function()
{
    $("#editDoneData").on("popupbeforeposition", function(event, ui) { 
		$( "#flipDoneFinished" ).prop( 'checked', false ).flipswitch( 'refresh' );
        $( '#textdoneinputName' ).blur();
	    $("#textdoneinputName").val( 
          scrumDataManager.activeDataSet.scrumDataArray[ scrumDataIdInDoneEditor ].featurename );
		$("#selectDoneComplexityEditPopup").val(
          scrumDataManager.activeDataSet.scrumDataArray[ scrumDataIdInDoneEditor ].complexity )
                .selectmenu( "refresh", true );
		$("#descriptionDoneAreaEditPopup").val(
         scrumDataManager.activeDataSet.scrumDataArray[ scrumDataIdInDoneEditor ].description );
        });
	    $( "#editorDoneOkButton" ).click(function() {
          if( !$( "#flipDoneFinished" ).is( ':checked' ) )
          {
            scrumDataManager.activeDataSet.scrumDataArray[ scrumDataIdInDoneEditor ]
                    .featurename = $("#textdoneinputName").val();
            scrumDataManager.activeDataSet.scrumDataArray[ scrumDataIdInDoneEditor ]
                    .complexity  = $("#selectDoneComplexityEditPopup").val();
            scrumDataManager.activeDataSet.scrumDataArray[ scrumDataIdInDoneEditor ]
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
        $( '#textinputName' ).blur();
		$( "#flipFinished" ).prop( 'checked', true ).flipswitch( 'refresh' );
	    $("#textinputName").val( 
          scrumDataManager.activeDataSet.scrumDataArray[ scrumDataIdInEditor ].featurename );
		$("#selectComplexityEditPopup").val(
          scrumDataManager.activeDataSet.scrumDataArray[ scrumDataIdInEditor ].complexity )
                .selectmenu( "refresh", true );
		$("#descriptionAreaEditPopup").val(
         scrumDataManager.activeDataSet.scrumDataArray[ scrumDataIdInEditor ].description );
        });
	    $( "#editorOkButton" ).click(function() {
          if( $( "#flipFinished" ).is( ':checked' ) )
          {
            scrumDataManager.activeDataSet.scrumDataArray[ scrumDataIdInEditor ].featurename = 
               $("#textinputName").val();
            scrumDataManager.activeDataSet.scrumDataArray[ scrumDataIdInEditor ].complexity = 
               $("#selectComplexityEditPopup").val();
            scrumDataManager.activeDataSet.scrumDataArray[ scrumDataIdInEditor ].description = 
               $("#descriptionAreaEditPopup").val();
     		SendUpdateOfScrumDataToServer( scrumDataIdInEditor );
          }
          else
          {
           SendDoneToServer();
          }
	});	
    $("#addData").on("popupbeforeposition", function(event, ui) { 
        console.log( "popupbeforeposition addData " );
        $("#textinputNameAdd").blur();
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




/////////////////////   Network functions   //////////////////////////////////

function SendCreateAnonymousProject()
{
    console.log( "Sending new project to server." );
    socket.emit(scrumDataManager.commandToServer.CREATE_ANONYMOUS_PROJECT, {} );
}

function SendUpdateOfScrumDataToServer( id )
{
    console.log( "Sending update: " 
                 + JSON.stringify( scrumDataManager.activeDataSet.scrumDataArray[ id ] ) );
	socket.emit(scrumDataManager.commandToServer.UPDATE_DATA, 
                scrumDataManager.activeDataSet.scrumDataArray[ id ] );
}

function SendDoneToServer()
{
	socket.emit( scrumDataManager.commandToServer.FINISH,
                 scrumDataManager.activeDataSet.scrumDataArray[ scrumDataIdInEditor ] );
}

function SendReopenToServer()
{
	socket.emit( scrumDataManager.commandToServer.REOPEN,
                 scrumDataManager.activeDataSet.scrumDataArray[ scrumDataIdInDoneEditor ] );
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
    if( typeof io == 'undefined' ) // Unit tests do not define io
    {
        return;
    }
    // test what database must be opened based un URL
    var db = window.location.href.split( /\// )[3];
    console.log( "Socket db: " + db );
	// initiate WebSocket
    socket = io.connect('/ScruB', { query: 'db='+db } );

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
        ComputeChartData();
        StartIntegrityCheckTimeout();
        UpdateProjectInformation();
    });

    socket.on( scrumDataManager.commandToClient.REOPEN, function ( data )
    {
		console.log( "received reopen data: " + data.featurename );
        scrumDataManager.UpdateData( data );
        scrumDataManager.SetDoneState( data.id, false );
		SetDoneListForElement( data, false );
        ComputeChartData();
        StartIntegrityCheckTimeout();
        UpdateProjectInformation();
    });


    socket.on( scrumDataManager.commandToClient.ADD_DATA_TO_FRONT, function ( data )
    {
		console.log( "received add data: " + data.featurename );
		scrumDataManager.AddDataToFront( data );
		AddDataDataFrontList( data );
        $( '#scrumDataList' ).listview('refresh');
        ComputeChartData();
        StartIntegrityCheckTimeout();
        UpdateProjectInformation();
    });

    // update non-order related data
    socket.on( scrumDataManager.commandToClient.UPDATE_DATA, function (data) {
		UpdateBacklogData( data );
        ComputeChartData();
        UpdateProjectInformation();
    });
	
    socket.on( scrumDataManager.commandToClient.NEW_PROJECT_CREATED, function (data) {
        console.log( "New project received: " + data.newId );
        $( "#OverheadText" ).html( "Created new project " + data.newId
                                   + ". Visit and bookmark <a href=\"/" 
                                   + data.newId + "/\" data-ajax=\"false\" > this link</a>." );
    });

	socket.on('scrubmoveup', function ( lowerElementId ) {
		console.log( "received scrubmoveup: " + lowerElementId );
		var upperElementId = scrumDataManager.activeDataSet.scrumDataArray[ lowerElementId ].previousPriorityId;
		scrumDataManager.MovePriorityUp( lowerElementId );
		if( upperElementId != -1 )
		{
			SwapListElements( upperElementId, lowerElementId );
		}
        $( '#scrumDataList' ).listview('refresh');
        StartIntegrityCheckTimeout();
        UpdateProjectInformation();
	});


	// complete scrum data array
	socket.on('scrubfulldata', function ( data ) {
		$("#scrumDataList").empty();
		$("#scrumDoneList").empty();
		scrumDataManager.activeDataSet.scrumDataArray   = data.dataArray.slice();
		scrumDataManager.activeDataSet.priorityStartId  = data.priorityStartId;
		scrumDataManager.activeDataSet.lastFinishedId   = data.lastFinishedId;
		scrumDataManager.activeDataSet.connectedDevices = data.connectedDevices;
		console.log( "full scrubdata received, length:" 
			    + scrumDataManager.activeDataSet.scrumDataArray.length );
		var prioId = scrumDataManager.activeDataSet.priorityStartId;
		while( prioId != -1 )
		{
			CreateDataListEntry( '#scrumDataList',
                                 scrumDataManager.activeDataSet.scrumDataArray[ prioId ], true );
			prioId = scrumDataManager.activeDataSet.scrumDataArray[ prioId ].nextPriorityId;
		}
        prioId = scrumDataManager.activeDataSet.lastFinishedId;
        console.log( "Creating done list with id: " + prioId );
		while( prioId != undefined &&  prioId != -1 )
		{
			CreateDataListEntry( '#scrumDoneList'
                                 ,scrumDataManager.activeDataSet.scrumDataArray[ prioId ], false );
			prioId = scrumDataManager.activeDataSet.scrumDataArray[ prioId ].nextPriorityId;
		}
        ComputeChartData();
        StartIntegrityCheckTimeout();
        UpdateProjectInformation();
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

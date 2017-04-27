$ (document).ready(function(){

//---------------------------
//------ TOOLBAR STUFF ------
//---------------------------

  $('#preview-button').on('click', function(){
    console.log("Clicked preview button")
    var rows = $('tr.selected')
    console.log(rows)
    console.log(rows.length)
    if (rows.length == 1){
      console.log(rows[0])
      img = $('tr.selected :first-child div img')
      console.log(img)
      img.trigger('click')
    }
  })

  $('.tool-bar-link').on('click', function(){

    var post_data ={}
    var num_rows = 0
    event.preventDefault()
    for(var i = 0; i < $('.selected').length; i=i+1){
        console.log($('.selected')[i].attributes)

        var id = ($('.selected')[i].attributes[1].value)
        var type = ($('.selected')[i].attributes[2].value)


        post_data[i]= {"type": type,'id': id,}
        num_rows +=1
    }


    post_data['csrfmiddlewaretoken'] = document.getElementsByName('csrfmiddlewaretoken')[0].value
    post_data["num_rows"] = num_rows
    $.post({
        url:'/move_to_trash',
        data: post_data,
        dataType:'json',
        success: function(res){
            console.log(res)
            $.get({
                url: "/folder_body/" + res.current_folder,
                success:function(new_html){
                    replaceTableBody(new_html)
                    // assignSelectionHandler();
                }
            })
        }


    })

  })



  //-------------------------
  //-----  AJAX MENUS  ------
  //-------------------------


  $('#account-dropdown-button').dropdown({
      inDuration: 100,
      outDuration: 100,
      constrainWidth: false, // Does not change width of dropdown to that of the activator
      hover: false, // Activate on hover
      gutter: 14, // Spacing from edge
      belowOrigin: true, // Displays dropdown below the button
      alignment: 'left', // Displays dropdown with edge aligned to the left of button
      stopPropagation: false // Stops event propagation
    }
  );
  $('#new-button').dropdown({
      inDuration: 100,
      outDuration: 100,
      constrainWidth: false, // Does not change width of dropdown to that of the activator
      hover: false, // Activate on hover
      gutter: 14, // Spacing from edge
      belowOrigin: true, // Displays dropdown below the button
      alignment: 'left', // Displays dropdown with edge aligned to the left of button
      stopPropagation: false // Stops event propagation
    }
  );


  $('#file-upload-button').on('click', function(){
    // event.preventDefault()
    console.log("Clicked file upload button")
    $('#file-input').trigger('click');
  })
  assignFileUploadHandler();

  $('#new-folder-button').on('click', function(){
        $('#modal1').modal();
  })


  $('#account-dropdown.dropdown-content').on('click', function(){
    event.stopPropagation();
  })

  $('#sign-out-button').on('click', function(){
    post_data = {}
    post_data['csrfmiddlewaretoken'] = document.getElementsByName('csrfmiddlewaretoken')[0].value
    $.post({
      url:$(this).attr('href'),
      dataType:'json',
      data:post_data,
      success:function(res){
        console.log(res)
        if (res.redirect !== undefined && res.redirect){
          window.location.href = res.redirect_url
        }
      }
    })
  })


  //------------------------------
  //---- NAVIGATION TAB STUFF ----
  //------------------------------


  $('#left-bar-tab-menu li').on('click', function(){

    console.log("clicked left bar tab")
    console.log($(this))
    $('#left-bar-tab-menu li').removeClass('selected')
    $(this).addClass('selected')

  })

  $('#my-drive-tab').on('click', function(){
    console.log("Clicked my drive")
    $.get({
      url: $(this).attr('href'),
      success:function(res){
        // console.log(res)
        replaceTableBody(res)
      }
    })
  })
////// WRITE THE DELETE route like above, look at the html too!


  //---------------------------
  //------ ROW SELECTION ------
  //---------------------------


  var lastSelectedRow;
  $('#table-body').on('click', 'tr.item-row', function(){
      var rows = $('#tbody-content-table tr')
      console.log("triggered row selection handler")
      RowClick($(this),false,rows)
      $('#selection-tools').css('display', 'inline-block')
      var selected = $('tr.selected')
      if (selected.length == 1){
        // console.log("There is one row selected")
        selected_type = $(selected[0])[0].attributes['item-type'].value
        // console.log(selected_type)
        if (selected_type != "folder"){
          $('#preview-button').css('display', 'inline-block')
        }else{
          $('#preview-button').css('display', 'none')
        }
      } else{
        // console.log("there are... " + String(selected.length) + " rows selected")
        $('#preview-button').css('display', 'none')
      }
  })


  //---------------------------
  //---- FOLDER NAVIGATION ----
  //---------------------------

  $('#table-body').on('click','.folder-text a', function(){
    console.log("You just clicked a folder link!")
    event.preventDefault()
    $.get({
      url: $(this).attr('href'),
      success:function(res){
        replaceTableBody(res)
      }
    })
  })

  //Initialize first view of root folder
  $.get({
    url: $('#my-drive-tab').attr('href'),
    success:function(res){
      // console.log(res)
      replaceTableBody(res)
    }
  })

  //--------------------------
  //----- BEAUTIFICATION -----
  //--------------------------





})//END OF DOCUMENT.READY FUNCTION




//----------------------------
//----- HELPER FUCNTIONS -----
//----------------------------



// disable text selection
document.onselectstart = function() {
    return false;
}

function RowClick(currenttr, lock, rows) {
    if (window.event.ctrlKey) {
        toggleRow(currenttr);
    }

    if (window.event.button === 0) {

        if (!window.event.ctrlKey && !window.event.shiftKey) {
            clearAll(rows);
            toggleRow(currenttr);
        }

        if (window.event.shiftKey) {
            selectRowsBetweenIndexes([lastSelectedRow.index(), currenttr.index()], rows)
        }
    }
}

function toggleRow(row) {
    if (!row.hasClass('header-row')){
        if (row.hasClass('selected')){
            row.removeClass('selected')
            console.log (rows)
        }
        else{
            row.addClass('selected')

        }
        lastSelectedRow = row;
        }

}

function selectRowsBetweenIndexes(indexes,rows) {
    indexes.sort(function(a, b) {
        return a - b;
    });

    for (var i = indexes[0]; i <= indexes[1]; i++) {
        $(rows[i+1]).addClass('selected');
    }
}

function clearAll(rows) {
    for (var i = 0; i < rows.length; i++) {
        $(rows[i]).removeClass("selected");
    }
}

function replaceTableBody(new_html){
  console.log("replacing html...")
  $('#selection-tools').fadeOut(300)
  $('#table-body').fadeOut(300, function(){
    $('#table-body').html(new_html)
    $('#table-body').delay(100).fadeIn(300, function(){
      console.log('done')
      $('.materialboxed').materialbox();
      assignFileUploadHandler()

    })
  })
}

function assignFileUploadHandler(){
  $('#file-input').on('change', function(){
    console.log("triggered file input on change")
    $('#file-upload-form').submit();
  })

}

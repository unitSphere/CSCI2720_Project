// Authors: Alejandro Elizondo 1155123257, Ubaydullo Rustami 1155102622, Andres Tamez 1155123046


$(document).ready(function() {
    document.getElementById("hiddenText").value = "";

    // DataTable
    var table = $('#events').DataTable({
        responsive: true,
        "scrollX": false,
        "paging":   false,
        "info": false,
        'initComplete': function() {$("#events").css("display", "block");}
    });

    $('#events tfoot th').each( function () {
        var title = $(this).text();
        $(this).html( '<input type="text" placeholder="Search '+title+'" />' );
    } );

    // Apply the search
    table.columns().every( function () {
        var that = this;

        $( 'input', this.footer() ).on( 'keyup change', function () {
            if ( that.search() !== this.value ) {
                that
                .search( this.value )
                .draw();
            }
        } );
    } );
    $('#events tfoot tr').appendTo('#events thead');

    $('#add').click( function () {
        var selectedRows = table.rows('.selected').data();

        let data = {id: selectedRows[0][0] };
        $.ajax({
            type: 'POST',
            url: '/favorites',
            data: data,
            success: function(data) {
                alert(data);
            }
        });
    } );

    $('#view').click( function () {
        if($(document.getElementById("hiddenText").value.equals(""))) {
            alert("Select a row");
        }
        // var selectedRows = table.rows('.selected').data();
        // //alert(window.location);
        // //window.location.replace("http://localhost:3000/event/"+selectedRows[0][0]);
        // window.location.replace("http://localhost:3000/home/event/"+selectedRows[0][0]);
    } );
} );

function selectFirst(e) {
    if (document.getElementById("hiddenText").value =="") {
        alert("Select a row");
        e.preventDefault();
        return false;
    } else {
        return true;
    }
}

$(document).on('click', "#events tr",function(){
    $('#events tr').not(this).removeClass('selected');
    if ($(this).hasClass('selected')) {
        $(this).removeClass('selected');
        document.getElementById("hiddenText").value = "";
    } else {
      document.getElementById("hiddenText").value = $(this).children().closest("td").html();
      $(this).addClass('selected');
  }
});

// Authors: Alejandro Elizondo 1155123257, Ubaydullo Rustami 1155102622, Andres Tamez 1155123046


$(document).on('click', "#reg",function(){
	if ($("#usr").val().length < 4 || $("#usr").val().length >= 20  ||
		$("#pas").val().length < 4 || $("#pas").val().length >= 20 )
		alert("Username and password must be of at least 4 and max 20 characters.");
	else {
		let data = {usr: $("#usr").val(), psw: $("#pas").val()};
		$.ajax({
			type: 'POST',
			url: '/register',
			data: data,
			success: function(data) {
				$("#usr").val("");
				$("#pas").val("");
				alert(data);
			}
		});
	}
});

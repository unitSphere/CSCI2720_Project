// Authors: Alejandro Elizondo 1155123257, Ubaydullo Rustami 1155102622, Andres Tamez 1155123046


$(document).on('click', "#comentar",function(){
	let data = {text: $("#comment").val()};
	$.ajax({
		type: 'POST',
		url: '/event',
		data: data,
		success: function(data) {
			let element = $("<li><div><H6></H6></div></li>");//.text($("#comment").val());
			//<li class="list-group-item"><div class="media-body"><H6><%=comments[i]%></H6></div></li>
			element.addClass("list-group-item");
			element.find("div").addClass("media-body");
			element.find("H6").text(data + ": " + $("#comment").val());
			$(commentList).append(element);
			$("#comment").val('');
		}
	});
});

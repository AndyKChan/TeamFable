(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.5&appId=952898294826486";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

$(document).ready(function(){
  $('#addf').on('click',function(){
    $('#addf').hide();
    $('#delf').show();
    $.ajax({
      method: "POST",
      url: "/addfavourite",
      data:{data:"{{user.local.username}}",comic:"{{comic.comic.comicName}}"}
    }).done(function(data){
      alert(data);
    });
  });
});

$(document).ready(function(){
  $('#pubc').on('click',function(){
    $('#pubc').hide();
    $('#upubc').show();
    $.ajax({
      method: "POST",
      url: "/publishcomic",
      data:{comic:"{{comic.comic.comicName}}"}
    }).done(function(data){
      alert(data);
    });
  });
});
$(document).ready(function(){
  $('#upubc').on('click',function(){
    $('#upubc').hide();
    $('#pubc').show();
    $.ajax({
      method: "POST",
      url: "/unpublishcomic",
      data:{comic:"{{comic.comic.comicName}}"}
    }).done(function(data){
      alert(data);
    });
  });
});

$(document).ready(function(){
  $('#delf').on('click',function(){
    $('#delf').hide();
    $('#addf').show();
    $.ajax({
      method: "POST",
      url: "/delfavourite",
      data:{data:"{{user.local.username}}",comic:"{{comic.comic.comicName}}"}
    }).done(function(data){
      alert(data);
    });
  });
});

$(document).ready(function() {
  $.ajax({
      type: "POST",
      url: "/getRating",
      data:{comicName:"{{comic.comic.comicName}}"}
    }).done(function(data){
      var yourRating = parseInt(data);
        for(i = 1; i < yourRating+1; i++ ){
       $("#"+i.toString()).css("color","#FFD700");
     }
    });
  });

$(document).ready(function() {
   $(".glyphicon-star-empty").on('click',function() {
      for(i = 1; i < 6; i++ ){
       $("#"+i.toString()).css("color","black");
     }
    id = parseInt($(this).attr('id'));
      for(i = 1; i < id+1; i++ ){
       $("#"+i.toString()).css("color","#FFD700");
     }
   
   }); 
});

$(document).ready(function(){
   $(".glyphicon-star-empty").on('click',function() {
   $.ajax({
      method: "PUT",
      contentType: "application/json",
      url: "/updateRating",
      data:JSON.stringify({rating:$(this).attr("id"),comicName:"{{comic.comic.comicName}}"}),
      }).done(function(data){
        $("#reloadRating").text(data);
      });
});
});

$(document).ready(function(){
  $('#desup').on('click',function(){
    $.ajax({
      method: "POST",
      url: "/updatdes",
      data:{data:$('#desc').val(),comic:"{{comic.comic.comicName}}"}
    }).done(function(data){
      alert("saved!");
      $('#desc').val(data);
    });
  });
});

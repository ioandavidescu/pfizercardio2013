$(document).ready(function() {  


$('#norvasc').click(function() { window.open("norvasc.html","_blank"); }); 
$('#caduet').click(function() {  window.open("caduet.html","_blank"); });
$('#sortis').click(function() {  window.open("sortis.html","_blank"); });


$('#sortis').delay(900).animate({opacity:100,left:'18',useTranslate3d:true},500)
$('#caduet').delay(600).animate({opacity:100,left:'360',useTranslate3d:true},500)
$('#norvasc').delay(300).animate({opacity:100,left:'697',useTranslate3d:true},500)

});

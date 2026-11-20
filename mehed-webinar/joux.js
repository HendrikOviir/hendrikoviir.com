(function(){
var root=document.documentElement,th=document.getElementById("th");
function set(t){root.setAttribute("data-theme",t);if(th){th.textContent=t==="dark"?"☀︎":"☾";th.setAttribute("aria-label",t==="dark"?"Hele vaade":"Tume vaade")}}
var t="dark";try{t=localStorage.getItem("joux_theme")||"dark"}catch(e){}
set(t);
if(th)th.onclick=function(){t=root.getAttribute("data-theme")==="dark"?"light":"dark";set(t);try{localStorage.setItem("joux_theme",t)}catch(e){}};
})();

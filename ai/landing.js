/* 3D Earth landing for screen 1: camera comes in from deep space toward Europe / Estonia
   and levels out over the horizon. Texture: NASA Blue Marble (public domain, via Wikimedia). */
(function(){
var T=window.THREE,R=1,ok=false,ren,scene,cam,earth,clouds,atmo,group,box,z=0,t0=performance.now(),raf=0;
function P(lat,lon,r){var ph=(lon+180)*Math.PI/180,th=(90-lat)*Math.PI/180;
  return new T.Vector3(-Math.cos(ph)*Math.sin(th),Math.cos(th),Math.sin(ph)*Math.sin(th)).multiplyScalar(r||1)}
function ease(x){return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2}
function cloudTex(){ // soft procedural cloud layer (alpha), no download
  var w=1024,h=512,c=document.createElement('canvas');c.width=w;c.height=h;var g=c.getContext('2d'),img=g.createImageData(w,h);
  var s=7;function rnd(){s=(s*16807)%2147483647;return s/2147483647}
  var G=[];for(var o=0;o<5;o++){var n=4<<o,a=[];for(var i=0;i<(n+1)*(n/2+1);i++)a.push(rnd());G.push({n:n,a:a})}
  function val(o,x,y){var n=o.n,m=n/2,X=x*n,Y=y*m,i=Math.floor(X),j=Math.floor(Y),fx=X-i,fy=Y-j,W=n+1;
    function A(ii,jj){return o.a[(jj%(m+1))*W+(ii%n)]}fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);
    return (A(i,j)*(1-fx)+A(i+1,j)*fx)*(1-fy)+(A(i,j+1)*(1-fx)+A(i+1,j+1)*fx)*fy}
  for(var y=0;y<h;y++)for(var x=0;x<w;x++){var v=0,amp=.55;for(var o=0;o<5;o++){v+=val(G[o],x/w,y/h)*amp;amp*=.5}
    var al=Math.max(0,Math.min(1,(v-.56)*3.2))*Math.min(1,Math.sin(Math.PI*y/h)/.42),k=(y*w+x)*4;img.data[k]=img.data[k+1]=img.data[k+2]=255;img.data[k+3]=al*215}
  g.putImageData(img,0,0);var t=new T.CanvasTexture(c);t.wrapS=T.RepeatWrapping;return t}
var d0,C1,L1,N1,LIGHT;
function setupPath(){
  d0=P(46,16).normalize();                       // start: looking at Europe + Africa top
  var E=P(59,25),S=P(47,10);                      // Estonia, and the low point we level out over
  N1=S.clone().normalize();C1=N1.clone().multiplyScalar(1.035);
  var fwd=E.clone().sub(S);fwd.sub(N1.clone().multiplyScalar(fwd.dot(N1))).normalize(); // tangent toward Estonia
  L1=C1.clone().add(fwd.clone().sub(N1.clone().multiplyScalar(.46)).normalize());       // slightly down: horizon in upper third
}
function dist0(){var f=cam.fov*Math.PI/180,hf=2*Math.atan(Math.tan(f/2)*cam.aspect);return 1/Math.sin(Math.min(f*.33,hf*.46))} // globe ≈60% of view height, text sits above it
function place(){
  var x=Math.min(1,z/.45),e=ease(x),idle=(performance.now()-t0)/1000*.03*(1-e);
  group.rotation.y=-e*.6+idle;group.updateMatrixWorld(true);
  var D0=dist0(),dir=d0.clone().lerp(C1.clone().normalize(),e).normalize();
  var r=Math.exp(Math.log(D0)*(1-e)+Math.log(1.035)*e);
  var pos=dir.multiplyScalar(r),look=new T.Vector3().lerp(L1,Math.pow(e,1.6)),up=new T.Vector3(0,1,0).lerp(N1,Math.pow(e,1.3)).normalize();
  group.localToWorld(pos);group.localToWorld(look);up.applyQuaternion(group.quaternion);
  cam.position.copy(pos);cam.up.copy(up);cam.lookAt(look);
  var h=ren.domElement.height,w=ren.domElement.width;cam.setViewOffset(w,h,0,h*.04*(1-e),w,h); // globe sits low, slides back to centre on descent
  clouds.material.opacity=.55+.35*e;atmo.material.uniforms.k.value=1.2*(1-e);
}
function size(){var w=box.clientWidth||innerWidth,h=box.clientHeight||innerHeight;ren.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}
function loop(){raf=0;if(z<1){place();ren.render(scene,cam)}if(z<.02)raf=requestAnimationFrame(loop)}
function kick(){if(!raf)raf=requestAnimationFrame(loop)}
window.Landing={
  init:function(container){
    if(!T)return false;box=container;
    try{ren=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'})}catch(e){return false}
    if(!ren||!ren.getContext())return false;
    ren.setPixelRatio(Math.min(2,devicePixelRatio||1));ren.setClearColor(0,0);
    var cv=ren.domElement;cv.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:block';
    scene=new T.Scene();cam=new T.PerspectiveCamera(35,1,.001,100);group=new T.Group();scene.add(group);
    var small=innerWidth<760,tex=new T.TextureLoader().load(small?'earth-2k.jpg':'earth-4k.jpg',kick);
    tex.anisotropy=ren.capabilities.getMaxAnisotropy();if('sRGBEncoding' in T)tex.encoding=T.sRGBEncoding;
    earth=new T.Mesh(new T.SphereGeometry(R,128,96),new T.MeshPhongMaterial({map:tex,specular:new T.Color(0x1c2a38),shininess:9}));group.add(earth);
    clouds=new T.Mesh(new T.SphereGeometry(R*1.006,96,72),new T.MeshLambertMaterial({map:cloudTex(),transparent:true,opacity:.6,depthWrite:false}));group.add(clouds);
    atmo=new T.Mesh(new T.SphereGeometry(R*1.07,96,72),new T.ShaderMaterial({side:T.BackSide,transparent:true,blending:T.AdditiveBlending,depthWrite:false,
      uniforms:{k:{value:1.1}},
      vertexShader:'varying vec3 n;varying vec3 v;void main(){n=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);v=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
      fragmentShader:'uniform float k;varying vec3 n;varying vec3 v;void main(){float d=-dot(n,v);float a=pow(clamp(d/.36,0.,1.),3.);float m=smoothstep(.05,.8,n.x);vec3 c=mix(vec3(.36,.6,1.),vec3(.53,.98,.75),m);gl_FragColor=vec4(c*1.3,a*.95*m*k);}'}));
    group.add(atmo);
    scene.add(new T.AmbientLight(0x4a5a78,.75));scene.add(new T.HemisphereLight(0xbfd8ff,0x1a2230,.35));
    setupPath();
    var sun=new T.DirectionalLight(0xfff4e6,1.25);sun.position.copy(d0.clone().add(new T.Vector3(-.9,.5,.4))).multiplyScalar(10);scene.add(sun);
    var mint=new T.DirectionalLight(0x88F9C0,2.4);mint.position.copy(d0.clone().cross(new T.Vector3(0,1,0)).normalize().multiplyScalar(-1).add(d0.clone().multiplyScalar(-.1))).multiplyScalar(10);scene.add(mint); // mint edge light, like the head
    box.insertBefore(cv,box.firstChild);var img=box.querySelector('#globe');if(img)img.style.display='none';
    box.style.display='block';size();addEventListener('resize',function(){size();kick()});ok=true;kick();return true},
  set:function(v){z=Math.max(0,Math.min(1,v));if(ok)kick()}
};
})();

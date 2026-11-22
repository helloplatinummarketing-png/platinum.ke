/**
 * Runs in <head> BEFORE the page is drawn, and picks the home-page story layer
 * by adding classes to <html>:
 *
 *   (no class)         Layer 1: no JavaScript (incl. Opera Mini). Plain stacked sections.
 *   "story-flat"       Layer 2: flat CSS phone that swaps screens on scroll.
 *   "story-flat can-3d" capable device: Layer 3 (3D phone, build step 5) may take over.
 *
 * Layer 2 only (never 3D) for: no WebGL, reduced motion, low memory
 * (deviceMemory < 4), Save-Data, Opera Mini, WhatsApp / Facebook / Instagram
 * in-app browsers. Also adds "reduced-motion" when the user asked for less motion.
 *
 * For testing: add ?layer=1, ?layer=2 or ?layer=3 to the address.
 * Kept tiny and in old-style JavaScript so it runs on any browser.
 */
export const layerScript = `(function(){try{
var d=document.documentElement,n=navigator,ua=n.userAgent||"",c=n.connection||{};
var force=(location.search.match(/[?&]layer=([123])/)||[])[1];
if(force==="1")return;
var rm=!!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches);
if(rm)d.classList.add("reduced-motion");
d.classList.add("story-flat");
if(force==="2")return;
var operaMini=/Opera Mini|OPiOS/i.test(ua)||Object.prototype.toString.call(window.operamini)==="[object OperaMini]";
var inApp=/FBAN|FBAV|FB_IAB|FBIOS|Instagram|WhatsApp/i.test(ua);
var lowMem=n.deviceMemory&&n.deviceMemory<4;
if(force!=="3"&&(rm||c.saveData||lowMem||operaMini||inApp))return;
var cv=document.createElement("canvas"),gl=cv.getContext("webgl")||cv.getContext("experimental-webgl");
if(gl){var ext=gl.getExtension("WEBGL_lose_context");if(ext)ext.loseContext();d.classList.add("can-3d");}
}catch(e){}})();`;

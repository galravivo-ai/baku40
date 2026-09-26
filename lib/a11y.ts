// Accessibility-menu storage (design 9h), shared by the widget and the root layout.
export const A11Y_KEY = "baku40_a11y";

/** Inline script for <head>: applies saved settings before the first paint. */
export const A11Y_BOOT = `try{var a=JSON.parse(localStorage.getItem("${A11Y_KEY}")||"{}"),h=document.documentElement;for(var k in a){if(k==="size"){if(a.size>0)h.classList.add("a11y-size-"+a.size)}else if(a[k])h.classList.add("a11y-"+k)}}catch(e){}`;

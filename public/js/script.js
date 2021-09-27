let balanc_button = document.getElementById("balanc_button");
let balanc = document.getElementById("balanc");
let portaltime_button = document.getElementById("portaltime_button");
let portaltime = document.getElementById("portaltime");


let balanc_button1 = document.getElementById("balanc_button1");
let balanc1 = document.getElementById("balanc1");


balanc_button.addEventListener("click",()=>{
    balanc_button.style.display="none";
    balanc.style.display="flex";    

});


balanc.addEventListener("click",()=>{

    balanc.style.display="none";    
    balanc_button.style.display="block";

});

portaltime_button.addEventListener("click",()=>{
    portaltime_button.style.display="none";
    portaltime.style.display="flex";    

});


portaltime.addEventListener("click",()=>{

    portaltime.style.display="none";    
    portaltime_button.style.display="block";

});


balanc_button1.addEventListener("click",()=>{
    balanc_button1.style.display="none";
    balanc1.style.display="flex";    

});


balanc1.addEventListener("click",()=>{

    balanc1.style.display="none";    
    balanc_button1.style.display="block";

});
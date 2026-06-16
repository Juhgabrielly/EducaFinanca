function abrirMenu(){
    let menu = document.getElementById("menu");
    let body = document.getElementById("body")

    if(menu.style.width === "250px"){
        menu.style.width = "0";
    }else{
        menu.style.width = "250px";
    }
}

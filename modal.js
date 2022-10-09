/**********************************************************************************
Autor:  
    Ricardo Alves Carvalho
    ricardo.alves.carvalho@gmail.com

Data:
    08/03/2022
    08/10/2022 - acrescentei suporte a arrasto da janela

Requisitos:
    modal.css, colors.css

Exemplo:

    function mostrar(texto) {
        alert(texto); //texto do botão
    }

    function inicia() {
        showModal(
            "Título", 
            "<p>Corpo do diálogo</p>", 
            null, 
            ["Sim", "Não"],
            "mostrar"
        );
        //ajustes no diálogo podem ser realizados neste ponto
    }

Observação:
    A função não é síncrona como um showModal verdadeiro, portanto, é possível 
    manipular os elementos por script após a chamada da função. 

***************************************************************************************/

let posx = 0;
let posy = 0;

function noPx(str) {
    return parseInt(str.replace("px", ""));
}

function min(a, b) {
    if (b < a)
        return b;
    else
        return a;
}

function max(a, b) {
    if (b > a)
        return b;
    else
        return a;
}

function showModal(titulo, corpo, rodape, botoes, callback, validate) {
    const htmlModal = 
        '<div class="modal-content" id="mdid">' +
        '   <div class="modal-header">' +
        '        <span class="close">&times;</span> <!-- caracter X -->' +
        '       <h2 class="modal-title">&nbsp;</h2>' +
        '   </div>' +
        '   <div class="modal-body">' +
        '        <p>&nbsp;</p>' +
        '   </div>' +
        '   <div class="modal-footer">' +
        '        <div class="text-place"></div>' +
        '        <div class="button-place"></div>' +
        '   </div>' +
        '</div>';

    if (!validate) 
      validate = "__validate";


    let modal = document.getElementById("divModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "divModal";
        modal.classList.add("modal");
        document.body.appendChild(modal);
    }
    modal.innerHTML = htmlModal;

    const content = document.getElementById('mdid');
    content.draggable = true;

    modal.addEventListener(
        'mousedown',
        (evt) => {
            posx = evt.screenX;
            posy = evt.screenY;
        }
    );

    modal.addEventListener(
        'dragover',
        (evt) => {
            evt.preventDefault();
            evt.dataTransfer.dropEffect = "move";
        }
    );

    content.addEventListener(
        'dragstart',
        (evt) => {
            evt.dataTransfer.setDragImage(icoCanvas, 0, 0);
            evt.dataTransfer.setData('text', evt.target.id);           
        }
    );

    modal.addEventListener(
        'drop',
        (evt) => {
            evt.preventDefault();
            const deltaX  = evt.screenX - posx;
            const deltaY  = evt.screenY - posy;
            
            const dlg     = byId("mdid");
            const cs      = window.getComputedStyle(dlg);
            let   left    = noPx(cs.getPropertyValue("margin-left"));
            const width   = noPx(cs.getPropertyValue("width"));
            const height  = noPx(cs.getPropertyValue("height"));

            const back    = byId("divModal");
            const csb     = window.getComputedStyle(back);
            let   top     = noPx(csb.getPropertyValue("padding-top"));
            const bwidth  = noPx(csb.getPropertyValue("width"));
            const bheight = noPx(csb.getPropertyValue("height"));

            top  += deltaY;
            left += deltaX;
            top  = min(top, bheight - height);
            left = min(left, bwidth - width);
            top  = max(top, 0);
            left = max(left, 0);

            dlg.style.marginLeft  = left + "px";
            back.style.paddingTop = top + "px";
        }
    );

    content.addEventListener(
        'dblclick',
        (evt) => {
            const self = evt.target;
            formataQuadro(self);
        }
    );

    var close = document.getElementsByClassName("close")[0];   

    close.onclick = function() {
        retornar();
    }

    if (titulo) {
        document.getElementsByClassName("modal-title")[0].innerHTML = titulo;
    }
    if (corpo) {
        document.getElementsByClassName("modal-body")[0].innerHTML = corpo;
    }
    if (rodape || botoes) {
        document.getElementsByClassName("modal-footer")[0].style.display = "flex";
        if (rodape) {
            document.getElementsByClassName("text-place")[0].innerHTML = rodape;
        }

        if (Array.isArray(botoes)) {
            var htmlBotoes = "";
            var callbackText;
            for (let i=0; i < botoes.length; i++) {
                if (callback) {
                    callbackText = " onclick=\'if (" + validate + "(\"" + botoes[i] + "\")) {" + callback + "(\"" + botoes[i] + "\"); retornar();}\'";
                } else {
                    callbackText = " onclick=\'if (" + validate + "(\"" + botoes[i] + "\")) {retornar();}\'"; 
                }

                htmlBotoes += 
                    '<input type="button" class="botao" value="' + 
                    botoes[i] + '"' + callbackText +
                   '></input>';
            }
            document.getElementsByClassName("button-place")[0].innerHTML = htmlBotoes;
        }
        
    } else {
        document.getElementsByClassName("modal-footer")[0].style.display = "none";
    }
    
    modal.style.display = "block";
}

function retornar() {
    document.getElementById("divModal").style.display = "none";
}

function __validate() {
    return true;
}

function showModal2(titulo, corpo, rodape, botoes, callback, validate) {
    const htmlModal = 
        '<div class="modal-content">' +
        '   <div class="modal-header">' +
        '        <span class="close2">&times;</span> <!-- caracter X -->' +
        '       <h2 class="modal-title2">&nbsp;</h2>' +
        '   </div>' +
        '   <div class="modal-body2">' +
        '        <p>&nbsp;</p>' +
        '   </div>' +
        '   <div class="modal-footer2">' +
        '        <div class="text-place2"></div>' +
        '        <div class="button-place2"></div>' +
        '   </div>' +
        '</div>';

    if (!validate) 
      validate = "__validate";


    let modal = document.getElementById("divModal2");
    modal.innerHTML = htmlModal;

    var close = document.getElementsByClassName("close2")[0];   

    close.onclick = function() {
        retornar2();
    }

    if (titulo) {
        document.getElementsByClassName("modal-title2")[0].innerHTML = titulo;
    }
    if (corpo) {
        document.getElementsByClassName("modal-body2")[0].innerHTML = corpo;
    }
    if (rodape || botoes) {
        document.getElementsByClassName("modal-footer2")[0].style.display = "flex";
        if (rodape) {
            document.getElementsByClassName("text-place2")[0].innerHTML = rodape;
        }

        if (Array.isArray(botoes)) {
            var htmlBotoes = "";
            var callbackText;
            for (let i=0; i < botoes.length; i++) {
                if (callback) {
                    callbackText = " onclick=\'if (" + validate + "(\"" + botoes[i] + "\")) {" + callback + "(\"" + botoes[i] + "\"); retornar2();}\'";
                } else {
                    callbackText = " onclick=\'if (" + validate + "(\"" + botoes[i] + "\")) {retornar2();}\'"; 
                }

                htmlBotoes += 
                    '<input type="button" class="botao" value="' + 
                    botoes[i] + '"' + callbackText +
                   '></input>';
            }
            document.getElementsByClassName("button-place2")[0].innerHTML = htmlBotoes;
        }
        
    } else {
        document.getElementsByClassName("modal-footer2")[0].style.display = "none";
    }
    
    modal.style.display = "block";
}

function retornar2() {
    document.getElementById("divModal2").style.display = "none";
}
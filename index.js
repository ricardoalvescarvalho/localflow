var corpo;
var num_quadro = 0;
var num_seta = 0;

const mmNormal = 0;
const mmNovo = 1;
const mmConectando = 2; //para obter quadro1
const mmLigando = 4; //para obter quadro2
var modoMouse = mmNormal;

const maNone = 0;
const maMovendo = 1;
const maHorizontal = 2;
const maVertical = 4; 
const maDiagonal = 8;
var modoArrasto = maNone;

const qcNone = 0;
const qcCirculo = 1;
const qcQuadrado = 2;
const qcLosango = 4;

var quadroClass = qcNone;

var quadro1 = null;
var quadro2 = null;

const point = {x: 0, y: 0};

let setas = [];
const icoCanvas = document.createElement('canvas');
const losangos_data = []; //{id, background, border}

const SUAVE = 400;
const NORMAL = 500;
const NEGRITO = 700;

//copiar colar
let clipItem = {};
let onCreateQuadro = null;
let formatItem = {};

//criar polígono no modal de propriedades
let modoAmostra = false;

var seta1 = null;



function byId(id) {
    return document.getElementById(id);
}

function inicia() {
    corpo = document.getElementById("corpo");

    corpo.addEventListener(
        'mousedown',
        (evt) => {
            const x = evt.offsetX;
            const y = evt.offsetY;
            if (modoMouse == mmNovo) {
                let current = quadroNovo(x, y);
                modoMouse = mmNormal;
                if (onCreateQuadro) {
                    onCreateQuadro(current);
                    onCreateQuadro = null;
                }
            }
            point.x = x;
            point.y = y;
        }
    );

    
    corpo.addEventListener(
        'mousemove',
        (evt) => {
            
            //exibir posição do mouse:
            let x = evt.offsetX;
            let y = evt.offsetY;
            //converter para posição em #corpo
            x += getX(evt.target);
            y += getY(evt.target);
            byId('status').innerHTML = 'X: ' + x + ' - y: ' + y;
            

            if (modoMouse == mmNormal) 
                corpo.style.cursor = 'default';
            else
                corpo.style.cursor = 'cell';
        }
    );    

    corpo.addEventListener(
        'dragover',
        (evt) => {
            evt.preventDefault();
            evt.dataTransfer.dropEffect = "move";
        }
    );

    corpo.addEventListener(
        'drop',
        (evt) => {
            evt.preventDefault();
            //obter polígono
            const id = evt.dataTransfer.getData('text');
            const poligono = byId(id);

            //posição do mouse em target (não necessariamente target = corpo)
            let x = evt.offsetX; 
            let y = evt.offsetY;

            //converter para posição em #corpo
            x += getX(evt.target);
            y += getY(evt.target);

            if (modoArrasto == maMovendo) {
                //ajustar posição do polígono na posição do mouse
                poligono.style.left = posX(x, poligono.offsetWidth);
                poligono.style.top  = posY(y, poligono.offsetHeight);
            } else if (modoArrasto == maVertical) {
                y -= poligono.offsetTop;
                const h = poligono.offsetHeight + y - point.y;
                poligono.style.height = h + 'px';
            } else if (modoArrasto == maHorizontal) {
                x -= poligono.offsetLeft;
                const w = poligono.offsetWidth + x - point.x;
                poligono.style.width = w + 'px';
            } else if (modoArrasto == maDiagonal) {
                if (tipo_quadro(poligono) == 'quadrado') {
                    y -= poligono.offsetTop;
                    x -= poligono.offsetLeft;

                    let h = poligono.offsetHeight + y - point.y;
                    let w = poligono.offsetWidth + x - point.x;
                    poligono.style.height = h + 'px'; 
                    poligono.style.width = w + 'px';
                } else {
                    y -= poligono.offsetTop;
                    x -= poligono.offsetLeft;

                    const deltaX = x / point.x;
                    const deltaY = y / point.y;
                    w = poligono.offsetWidth * deltaX;
                    h = poligono.offsetHeight * deltaY;
                    poligono.style.height = h + 'px'; 
                    poligono.style.width = w + 'px';
                }
            }

            modoMouse = mmNormal;
            modoArrasto = maNone;
            reposiciona_setas(id);
        }
    );

    document.body.addEventListener(
        'keydown',
        (evt) => {
            if (evt.key == 'Escape')
                cancela();
        }
    );
}

function getX(quadro) {
    let result = 0;
    while (quadro != corpo) {
        result += quadro.offsetLeft;
        quadro = quadro.parentNode;
    }
    return result;
}

function getY(quadro) {
    let result = 0;
    while (quadro != corpo) {
        result += quadro.offsetTop;
        quadro = quadro.parentNode;
    }
    return result;
}

function setEspera(id, blinking) {
    const links = document.getElementsByClassName('em-espera');
    for (let i = 0; i < links.length; i++ ) {
        links[i].classList.remove('blinking');
        links[i].classList.remove('em-espera');
    }

    if (id) {
        byId(id).classList.add('em-espera');
        if (blinking)
            byId(id).classList.add('blinking');
    }
}

function addCirculo() {
    modoMouse = mmNovo;
    quadroClass = qcCirculo;
    setEspera('a-circulo');
}

function addQuadrado() {
    modoMouse = mmNovo;
    quadroClass = qcQuadrado;
    setEspera('a-quadrado');
}

function addLosango() {
    modoMouse = mmNovo;
    quadroClass = qcLosango;
    setEspera('a-losango');
}

function addSeta() {
    if (modoMouse == mmNormal) {
        modoMouse = mmConectando;
        setEspera('a-seta');
    }
}

function quadroNovo(x, y, id) {
    let quadro;
    switch (quadroClass) {
        case qcCirculo:  quadro = novoCirculo(x, y);  break;
        case qcQuadrado: quadro = novoQuadrado(x, y); break;
        case qcLosango:  quadro = novoLosango(x, y);  break;
    }
    if (id) 
        quadro.id = id;
    return quadro;
}

//posiciona o polígono na mesma posição
//do mouse down (para arrasto)
function posX(p, width) {
    p -= point.x;
    if (p < 0) p = 0;
    
    const w = corpo.clientWidth - width;
    if (p > w) p = w;

    return p + 'px';
}

function posY(p, height) {
    p -= point.y;
    if (p < 0) p = 0;

    const h = corpo.clientHeight - height;
    if (p > h) p = h;

    return p + 'px';
}

//posiciona o polígono centralizado no point
//(para criação do polígono)
function pX(x, width) {
    x -= width / 2;
    if (x < 0) x = 0;
    
    const w = corpo.clientWidth - width;
    if (x > w) x = w;

    return x + 'px';
}

function pY(y, height) {
    y -= height / 2;
    if (y < 0) y = 0;

    const h = corpo.clientHeight - height;
    if (y > h) y = h;

    return y + 'px';
}

function novoPoligono(x, y, w, h) {
    const poligono = document.createElement("div");
    const texto = document.createTextNode("");
    poligono.appendChild(texto);
    poligono.classList.add('quadro');
    poligono.style.top = pY(y, h);
    poligono.style.left = pX(x, w);
    poligono.style.width = w + 'px';
    poligono.style.height = h + 'px';
    poligono.style.backgroundColor = "white";  
    poligono.style.color = '#404040';   
    poligono.style.fontWeight = NORMAL;

    if (modoAmostra) {
        byId('amostra').appendChild(poligono);
        return poligono;
    }
    
    poligono.draggable = true;
    poligono.id = 'p' + num_quadro;
    num_quadro++;
    corpo.appendChild(poligono);

    poligono.addEventListener(
        'dragstart',
        (evt) => {
            if (modoArrasto != maMovendo)
                evt.dataTransfer.setDragImage(icoCanvas, 0, 0);
            evt.dataTransfer.setData('text', evt.target.id);           
        }
    )

    poligono.addEventListener(
        'dblclick',
        (evt) => {
            const self = evt.target;
            formataQuadro(self);
        }
    )

    poligono.addEventListener(
        'click',
        (evt) => {
            if (modoMouse == mmConectando) {
                quadro1 = assert_container(evt.target);
                quadro2 = null;
                modoMouse = mmLigando;
                setEspera('a-seta', true);
            } else if (modoMouse == mmLigando) {
                quadro2 = assert_container(evt.target);
                novaSeta();
                quadro1 = null;
                quadro2 = null;
                modoMouse = mmNormal;
                setEspera();
            } 
            seleciona(evt.target);
        }
    )

    poligono.addEventListener(
        'mousemove',
        (evt) => {
            const ponto = {'x': evt.offsetX, 'y': evt.offsetY};
            if (ponto_em_redim_vert(ponto, evt.target))
                modoArrasto = maVertical;
            else if (ponto_em_redim_horz(ponto, evt.target))
                modoArrasto = maHorizontal;
            else if (ponto_em_redim_diag(ponto, evt.target))
                modoArrasto = maDiagonal;
            else
                modoArrasto = maMovendo;
            
            switch (modoArrasto) {
                case maVertical:
                    evt.target.style.cursor = 'n-resize';
                    break;
                case maHorizontal:
                    evt.target.style.cursor = 'e-resize';
                    break;
                case maDiagonal:
                    evt.target.style.cursor = 'nw-resize';
                    break;
                default:
                    evt.target.style.cursor = 'pointer';
            }
        }
    );

    setEspera();

    return poligono;
}

function assert_container(quadro) {
    if (quadro.classList.contains('losango'))
        quadro = quadro.parentNode;
    return quadro;
}

function getText(quadro) {
    if (quadro.classList.contains('losango-container'))
        quadro = quadro.childNodes[1];
    if (quadro.classList.contains('losango')) {
        return quadro.dataset.content;
    } else if (quadro.classList.contains('seta')) {
        const cs = window.getComputedStyle(quadro, 'after');
        let pv = cs.getPropertyValue("content");
        pv = pv.substring(1, pv.length - 1); //remover aspas
        return pv;
    } else {
        const node = quadro.childNodes[0];
        return node.data;
    }
}

function setText(quadro, text) {
    const node = quadro.childNodes[0];
    if (quadro.classList.contains('losango-container'))
        quadro = quadro.childNodes[1];
    if (quadro.classList.contains('losango')) {
        quadro.dataset.content = text;
    } else {
        node.data = text;
    }   
}

function getBackground(quadro) {
    let pseudo = null;
    if (quadro.classList.contains('losango-container'))
        quadro = quadro.childNodes[1];
    if (quadro.classList.contains('losango'))
        pseudo = 'before';
    return getBackgroundColor(quadro, pseudo);
}

function setBackground(quadro, background) {
    if (quadro.classList.contains('losango-container'))
        quadro = quadro.childNodes[1];
    if (quadro.classList.contains('losango')) 
        //quadro.setAttribute('style', '--background: ' + background);
        assert_style(quadro, 'background', background);
    else
        quadro.style.backgroundColor = background;
}

function assert_style(losango, prop, value) {
    const id = assert_container(losango).id;
    let data = losangos_data.find((item) => {return item.id == id;});
    if (losango.classList.contains('losango-container'))
        losango = losango.childNodes[1];
    data[prop] = value;
    const style = '--background:'+data.background + 
        '; background-color:' + data.border + 
        '; --border-color:' + data.border + 
        '; color:' + data.border + ';';
    losango.setAttribute('style', style);
}

function getBorder(quadro) {
    const selecionado = quadro.classList.contains('selecionado');
    if (selecionado)
        quadro.classList.remove('selecionado');
    if (quadro.classList.contains('losango-container'))
        quadro = quadro.childNodes[1];
    let color;
    if (quadro.classList.contains('losango'))
        color = getBackgroundColor(quadro);
    else
        color = getBorderColor(quadro);
    if (selecionado)
        quadro.classList.add('selecionado');
    return color;
}

function setBorder(quadro, borda) {
    const selecionado = quadro.classList.contains('selecionado');
    if (selecionado)
        quadro.classList.remove('selecionado');
    if (quadro.classList.contains('losango-container'))
        quadro = quadro.childNodes[1];
    if (quadro.classList.contains('losango')) {
        //quadro.setAttribute('style', '--border-color: #ff0000'); //selecionado
        //quadro.style.backgroundColor = borda;
        assert_style(quadro, 'border', borda);
    }
    else
        quadro.style.borderColor = borda;
    if (selecionado)
        quadro.classList.add('selecionado');
}

function getHeight(quadro) {
    quadro = assert_container(quadro);
    let h = quadro.style.height;
    h = Number.parseInt(h.substring(0, h.length - 1));
    return h;
}

function setHeight(quadro, height) {
    quadro = assert_container(quadro);
    quadro.style.height = height + 'px';
}

function getWidth(quadro) {
    quadro = assert_container(quadro);
    let w = quadro.style.width;
    w = Number.parseInt(w.substring(0, w.length - 1));
    return w;
}

function setWidth(quadro, width) {
    quadro = assert_container(quadro);
    quadro.style.width = width + 'px';
}

function getWeight(quadro) {
    const cs = window.getComputedStyle(quadro);
    let peso = cs.getPropertyValue("font-weight");
    if (peso != SUAVE && peso != NEGRITO)
        peso = NORMAL;
    return Number.parseInt(peso);
}

function setWeight(quadro, valor) {
    quadro = assert_container(quadro);
    quadro.style.fontWeight = valor;
}

function getItalic(quadro) {
    quadro = assert_container(quadro);
    let i = quadro.style.fontStyle;
    return i == 'italic';
}

function setItalic(quadro, valor) {
    quadro = assert_container(quadro);
    quadro.style.fontStyle = valor ? 'italic' : 'normal';
}

function getTextColor(quadro) {
    return getFontColor(quadro);
}

function novoCirculo(x, y) {
    const circulo = novoPoligono(x, y, 60, 60);
    circulo.classList.add('circulo');
    return circulo;
}

function novoQuadrado(x, y) {
    const quadrado = novoPoligono(x, y, 120, 80);
    quadrado.classList.add('quadrado');
    return quadrado;
}

function novoLosango(x, y) {
    let w = 100;
    let h = 80;
    const losango = novoPoligono(x, y, w, h);
    losango.classList.add('losango-container');
    const diamon = document.createElement('div');
    diamon.classList.add('losango');
    losango.appendChild(diamon);
    diamon.dataset.content = '';
    diamon.setAttribute('style', '--background: #ffffff; --border-color:#404040;');
    losangos_data.push({'id':losango.id, 'background':'#ffffff', 'border':'#404040'});
    return losango;
}

function getItemSeta(seta) {
    return setas.find((item) => {return item.id == seta.id;});
}

function novaSeta(id) {
    const item = {de: quadro1.id, para: quadro2.id, text: '', color: '#404040'};

    //não repetir seta já existente
    if (setas.findIndex(
        (seta) => {return seta.de == item.de && seta.para == item.para;}
        ) >= 0
    ) return;

    const seta = document.createElement("div");
    seta.classList.add('seta');
    if (id) 
        seta.id = id;
    else {
        seta.id = 's' + num_seta;
        num_seta++;
    }
    corpo.appendChild(seta);
    item.id = seta.id;
    setas.push(item);

    seta.addEventListener(
        'dblclick',
        (evt) => {
            const seta = evt.target;
            formataSeta(seta);  
        }
    );

    posiciona_seta(seta, quadro1, quadro2);
    return seta;
}

function posiciona_seta(seta, quadro_de, quadro_para) {
    const point1  = centro(quadro_de);
    const point2  = centro(quadro_para);
    const pnt     = centroSeta(point1, point2);
    const angle   = -pontosParaAngulo(point1, point2);
    const width   = distancia(point1, point2);
    pnt.x -= width / 2;
    const rec     = recuo(quadro_para, quadro_de);
    const inv_rec = recuo(quadro_de, quadro_para);
    const item    = getItemSeta(seta);
    const tw      = textWidth(item.text);
    const offset  = 9; //seta::after[padding-left] + largura-seta / 2
    const text_x  = Math.round((width - rec - inv_rec - tw) / 2 + inv_rec - offset);
    
    const style   = 
        'top: ' + pnt.y + 'px; left: ' + pnt.x + 'px; ' +
        '--angle: ' + angle + 'deg; --reverse-angle: ' + -(angle) + 'deg; ' +
        'width: ' + width + 'px;  --recuo: ' + rec + 'px; ' +
        "--text: '" + item.text + "'; --color: "+ item.color + "; " +
        "--text-left: " + text_x + 'px;';
    seta.setAttribute('style', style);
}

function reposiciona_setas(id_poligono) {
    setas.forEach(
        (item) => {
            if (item.de == id_poligono || item.para == id_poligono) {
                posiciona_seta(byId(item.id), byId(item.de), byId(item.para))
            }
        }
    )
}

async function remove_setas(id_poligono) {
    setas = setas.filter(
        (item) => {
            if (item.de == id_poligono || item.para == id_poligono) {
                byId(item.id).remove();
                return false;
            }
            return true;
        }
    );
    return true;
}

function seleciona(quadro) {
    const links = document.getElementsByClassName('selecionado');
    for (let i = 0; i < links.length; i++ ) 
        links[i].classList.remove('selecionado');
    if (quadro)
       quadro.classList.add('selecionado');
}

function erro(msg, detail) {
    alert(msg);
    if (detail)
        console.error(detail)
    else
        console.error(msg);
}

function delQuadro() {
    const links = document.getElementsByClassName('selecionado');
    if (links.length == 0) {
        erro('Nenhum elemento selecionado');
        return;
    }
    const q = assert_container(links[0]);
    remove_setas(q.id).then(q.remove());
}

function delSeta() {
    const id = seta1.id;
    setas = setas.filter(
        (item) => {
            if (item.id == id) {
                byId(id).remove();
                seta1 = null;
                return false;
            }
            return true;
        }
    );
    //fechar o modal:
    retornar();
}

function tipo_quadro(quadro) {
    if (quadro.classList.contains('circulo')) 
        return 'circulo';
    else if (quadro.classList.contains('quadrado'))
        return 'quadrado'
    else if (quadro.classList.contains('losango'))
        return 'losango';
    else if (quadro.classList.contains('losango-container'))
        return 'losango';
    else
        return '';
}

function recuo(quadro, outro_quadro) {
    let seta, cruzamento, dist;
    const largura_ponta = 10;
    switch (tipo_quadro(quadro)) {
        case 'circulo': 
            return quadro.offsetWidth / 2 + largura_ponta;
        case 'quadrado':
            const retangulo = [
                {'x':quadro.offsetLeft, 'y':quadro.offsetTop}, 
                {'x':quadro.offsetLeft+quadro.offsetWidth, 'y':quadro.offsetTop+quadro.offsetHeight}
            ];
            seta = [
                centro(quadro),
                centro(outro_quadro)
            ];
            cruzamento = cruzamento_seta_retangulo(seta, retangulo, outro_quadro);
            dist = distancia(cruzamento, centro(quadro));
            return dist + largura_ponta;
        case 'losango':
            const losango = [
                {'x':quadro.offsetLeft, 'y':quadro.offsetTop}, 
                {'x':quadro.offsetLeft+quadro.offsetWidth, 'y':quadro.offsetTop+quadro.offsetHeight}
            ];
            seta = [
                centro(quadro),
                centro(outro_quadro)
            ];
            cruzamento = cruzamento_seta_losango(seta, losango, outro_quadro);
            dist = distancia(cruzamento, centro(quadro));
            return dist + largura_ponta;
        default:
            return '0'; 
    }
}

function printElement(e) {
    const links = document.getElementsByTagName('link');
    let style = '';
    for (let i = 0; i < links.length; i++) {
        if (links[i].rel == 'stylesheet')
            style += links[i].outerHTML;
    }

    var win = window.open('', '', 'height=' + e.height + ',width=' + e.width);
    win.document.write('<html><head>');
    win.document.write(style);
    win.document.write('</head>');
    win.document.write('<body>');
    win.document.write(e.innerHTML);
    win.document.write('</body></html>');
    win.document.close();
    win.setTimeout(
        () => { win.print(); },
        300 //aguardar carregamento dos css
    );
}

function printCorpo() {
    printElement(corpo);
    return;
}

function textoModal() {
    return '' +
        '<div id="dlg-content">'+
        '<div id="dlg-top">'+
        '    <div class="row">'+
        '        <span class="align-vert-center">Texto</span>'+
        '        <input type="text" id="dlg-text">'+
        '    </div>'+
        '    <div class="row">'+
        '        <span>Estilo:</span>'+
        '        <input type="radio" name="peso" id="suave" value="400"><label for="suave" class="suave">Suave</label>'+
        '        <input type="radio" name="peso" id="normal" value="500"><label for="normal" class="normal">Normal</label>'+
        '        <input type="radio" name="peso" id="negrito" value="700"><label for="negrito" class="negrito">Negrito</label>'+
        '        <input type="checkbox" name="italico" id="italico"><label for="italico" class="italico">Itálico</label>'+
        '    </div>  '+
        '</div>'+
        '<div id="dlg-bottom">'+
        '    <div id="amostra">'+
        '    </div>'+
        '    <div id="dlg-buttons">'+
        '        <label for="btn-fundo" class="dlg-lbl">Fundo</label>'+
        '        <input id="btn-fundo" type="color" class="dlg-color">'+
        '        <label for="btn-fonte" class="dlg-lbl">Fonte</label>'+
        '        <input id="btn-fonte" type="color" class="dlg-color">'+
        '        <label for="btn-borda" class="dlg-lbl">Borda</label>'+
        '        <input id="btn-borda" type="color" class="dlg-color">'+
        '        <label for="inp-altura" class="dlg-lbl">Altura</label>'+
        '        <input type="number" id="inp-altura" class="dlg-number">'+
        '        <label for="inp-largura" class="dlg-lbl">Largura</label>'+
        '        <input type="number" id="inp-largura" class="dlg-number">'+
        '    </div>'+
        '</div>'+
        '</div>';
}

function textoSeta() {
    return '' +
        '<div id="dlg-content" class="dlg-content-seta">'+
        '<div id="dlg-top">'+
        '    <div class="row">'+
        '        <span class="align-vert-center">Texto</span>'+
        '        <input type="text" id="dlg-text">'+
        '    </div>'+
        '</div>'+
        '<div id="dlg-bottom">'+
        '    <div id="dlg-buttons">'+
        '        <label for="btn-fonte" class="dlg-lbl-seta">Fonte</label>'+
        '        <input id="btn-fonte" type="color" class="dlg-color">'+
        '    </div>'+
        '</div>'+
        '</div>';    
}

function textoRodape() {
    return '' +
        '<i class="fa fa-copy" style="font-size:24px" ' +
        'title="Copiar formato" onclick="copiarFormato();"></i>' +
        '<i class="fa fa-paste" style="font-size:24px" ' + 
        'title="Colar formato" onclick="colarFormato();"></i>';
}

function rodapeSeta() {
    return '' +
        '<i class="fa fa-remove" style="font-size:24px" ' +
        'title="Excluir seta" onclick="delSeta();"><span>Excluir</span></i>';
}

function copiarFormato() {
    formatItem = getFormatModal();
}

function colarFormato() {
    const keys = Object.keys(formatItem);
    if (keys.length == 0) {
        erro('Não há um formato disponível a ser aplicado');
        return;
    }
    setFormatModal();
}

function formataQuadro(self) {
    const text = getText(self);
    const html = textoModal();
    const rodape = textoRodape();
    const peso = getWeight(self);
    quadro1 = self;
   
    showModal(
        'Propriedades',
        html,
        rodape,
        ['OK', 'Cancelar'],
        "aplicarFormatoQuadro"
    );

    byId('dlg-text').value = text;
    byId('btn-fundo').value = getBackground(self);
    byId('btn-borda').value = getBorder(self);
    byId('btn-fonte').value = getColor(self);
    byId('inp-altura').value = getHeight(self);
    byId('inp-largura').value = getWidth(self);
    switch (peso) {
        case SUAVE: byId('suave').checked = true; break;
        case NEGRITO: byId('negrito').checked = true; break;
        default: byId('normal').checked = true;
    }
    byId('italico').checked = getItalic(self);
    byId('dlg-text').focus();
    byId('dlg-text').select();

    let q;
    modoAmostra = true;
    switch (tipo_quadro(self)) {
        case 'circulo':  q = novoCirculo(192 - 30, 323 - 30); break; //60 x 60
        case 'losango':  q = novoLosango(212 - 50, 333 - 40); break; //100 x 80
        case 'quadrado': q = novoQuadrado(223 - 60, 333 - 40); break; //120 x 80
    }
    modoAmostra = false;
    const f = getFormat(self);
    setFormat(q, f);
    setText(q, 'Texto');

    const inputs = document.querySelectorAll('#dlg-content input');
    for (let i = 0; i < inputs.length; i++)
        inputs[i].addEventListener(
        'change',
        () => {
            const format = getFormatModal();
            setFormat(q, format);
        }
    );
}

function formataSeta(self) {
    let text = getText(self);
    let color = getColorSeta(self);
    const html = textoSeta();
    const rodape = rodapeSeta();

    showModal(
        'Propriedades',
        html,
        rodape,
        ['OK', 'Cancelar'],
        "aplicarFormatoSeta"
    );
    
    byId('dlg-text').value = text;
    byId('btn-fonte').value = color;
    seta1 = self;
}

function aplicarFormatoQuadro(botao) {
    if (botao != "OK") 
        return;

    const text = byId('dlg-text').value;
    const background = byId('btn-fundo').value;
    const borda = byId('btn-borda').value;
    const color = byId('btn-fonte').value;
    const height = byId('inp-altura').value;
    const width = byId('inp-largura').value;
    const italic = byId('italico').checked;

    if (text === "" || text) 
        setText(quadro1, text);
    setBackground(quadro1, background);
    setBorder(quadro1, borda);
    quadro1.style.color = color;
    setHeight(quadro1, height);
    setWidth(quadro1, width);

    const peso = document.querySelector('.row > input[type=radio]:checked').value;
    setWeight(quadro1, peso);
    setItalic(quadro1, italic);


    quadro1 = null;
}

function aplicarFormatoSeta(botao) {
    if (botao != "OK") 
        return;

    const text = byId('dlg-text').value;
    const color = byId('btn-fonte').value; 
    const item = getItemSeta(seta1);
    item.text = text.trim();
    item.color = color;
    posiciona_seta(seta1, byId(item.de), byId(item.para));
}

function getFormat(quadro) {
    return {
        weight:     getWeight(quadro),
        italic:     getItalic(quadro),
        color:      getColor(quadro),
        background: getBackground(quadro),
        border:     getBorder(quadro)
    };
}

function getFormatModal() {
    return {
        weight:     document.querySelector('.row > input[type=radio]:checked').value,
        italic:     byId('italico').checked,
        color:      byId('btn-fonte').value,
        background: byId('btn-fundo').value,
        border:     byId('btn-borda').value
    };
}

function setFormat(quadro, format) {
    setWeight(quadro, format.weight);
    setItalic(quadro, format.italic);
    quadro.style.color = format.color;
    setBackground(quadro, format.background);
    setBorder(quadro, format.border);
}

function setFormatModal() {
    byId('btn-fundo').value = formatItem.background;
    byId('btn-borda').value = formatItem.border;
    byId('btn-fonte').value = formatItem.color;
    switch (formatItem.weight) {
        case SUAVE: byId('suave').checked = true; break;
        case NEGRITO: byId('negrito').checked = true; break;
        default: byId('normal').checked = true;
    }
    byId('italico').checked = formatItem.italic;
}


function quadroDef(quadro) {
    return {
        type:   tipo_quadro(quadro),
        text:   getText(quadro),
        height: getHeight(quadro),
        width:  getWidth(quadro),
        format: getFormat(quadro)
    };
}

function cancela() {
    modoMouse = mmNormal;
    modoArrasto = maNone;
    quadroClass = qcNone;
    setEspera();
    seleciona();
}

function copyQuadro() {
    const links = document.getElementsByClassName('selecionado');
    if (links.length == 0) {
        erro('Nenhum elemento selecionado');
        return;
    }
    const q = assert_container(links[0]);
    clipItem = quadroDef(q);
}

function pasteQuadro() {
    const tipo = clipItem.type;
    if (!tipo) {
        erro('Não há um objeto válido para colar');
        return;
    }
    switch (tipo) {
        case 'circulo':
            addCirculo();
            break;
        case 'quadrado':
            addQuadrado();
            break;
        case 'losango':
            addLosango();
            break;
        default:
            return;
    }  

    onCreateQuadro = (quadro) => {
        setText(quadro, clipItem.text);
        setHeight(quadro, clipItem.height);
        setWidth(quadro, clipItem.width);
        setFormat(quadro, clipItem.format); 
        onCreateQuadro = null; 
    }
}

function textWidth(text) {
    const element = document.createElement("span");
    corpo.appendChild(element);
    element.innerHTML = text;
    const width = Math.ceil(element.offsetWidth);
    corpo.removeChild(element);
    return width;
}

function show_about() {
    const html = 
        '<h2>LocalFlow</h2>' +
    
        /*
        '<p>Versão: ' + version + '</p>' +
        '<p>Licença: Free (sem garantias)</p>' +
        */
    
        '<table class="clear-table">' +
        '<tr><td>Versão:</td><td class="destaque">' + version + '</td></tr>' +
        '<tr><td>Licença:</td><td class="destaque">Free</td><td>(sem garantias)</td></tr>' +

        '<tr>' +
        '<td>Autor:</td><td class="destaque">Ricardo Alves Carvalho</td>' + 
        '<td><a href="mailto:ricardo.alves.carvalho@gmail.com">ricardo.alves.carvalho@gmail.com</td></tr>' +
        '<tr><td>Pix:</td><td class="destaque">+55 (31) 98717-9407</td></tr>'
        '</table>';

    showModal(
        'Sobre',
        html,
        null,
        ["OK"],
        null
    );
}

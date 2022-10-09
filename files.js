const version = '1.0';
var filename = '';

function fromQuadro(quadro) {
    return {
        'id': quadro.id,
        'type': tipo_quadro(quadro),
        'text': getText(quadro),
        'top': quadro.style.top,
        'left': quadro.style.left,
        'height': getHeight(quadro),
        'width': getWidth(quadro),
        'format': getFormat(quadro)
    }
}

function fromModel() {
    const quadros = document.getElementsByClassName('quadro');
    let result = [];
    result.push({'type':'flow-def'});
    result.push({'version': version});
    result.push({'length': quadros.length});
    for (let q of quadros) 
        result.push(fromQuadro(q));
    result.push(setas);
    return result;
}

function clear() {
    const quadros = document.getElementsByClassName('quadro');
    for (let i = quadros.length - 1; i >= 0; i--) {
        const q = assert_container(quadros[i]);
        remove_setas(q.id).then(q.remove());
    }
    return true;
}

function saveToFile(name) {
    /*if (closed()) {
        erro("Nothing to save!");
        return;
    }*/
    if (!name) name = filename;
    if (name == "") {
        erro("Nome de arquivo não definido!");
        return;
    }
    saveObjectToFile(fromModel(), name);
    filename = name;
}

function save_model() {
    const html =
        '<div class="show-box">' +
        '<label for="inp-file-name">Nome do arquivo</label>' +
        '<input type="text" id="inp-file-name"/>' +
        '</div>';
    showModal(
        "Salvar",
        html,
        null,
        ["OK", "Cancelar"],
        "save_request"
    );
    byId("inp-file-name").value = filename;
}

function save_request(button_text) {
    if (button_text != "OK") return;
    const inp = byId("inp-file-name");
    const name = inp.value;
    saveToFile(name);
}

function saveObjectToFile(obj, filename) {
    let text = JSON.stringify(obj);
    let blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    saveAs(blob, filename);    
}

function open_model() {
    file_dlg_execute(
        (content) => {
            const obj = JSON.parse(content);
            loadModel(obj);
        }
    )
}

function soAlgarismos(text) {
    let result = '';
    for (let i = 0; i < text.length; i++) 
        if ('0123456789'.indexOf(text[i]) >= 0)
            result += text[i];
    if (result == '')
        result = '0';
    return parseInt(result);
}

function loadModel(model) {
    if (model.length < 4 || model[0].type != 'flow-def') {
        console.log(model);
        erro('Modelo de dados inválido');
        return;
    }

    clear();

    const len = model[2].length;
    let n = 0;
    let max = 0;
    for (let i = 3; i < len + 3; i++) {
        const def = model[i];
        const x = soAlgarismos(def.left);
        const y = soAlgarismos(def.top);
        const id = def.id;
        n = soAlgarismos(id);
        if (n > max) 
            max = n;
        switch (def.type) {
            case 'circulo': quadroClass = qcCirculo; break;
            case 'quadrado': quadroClass = qcQuadrado; break;
            case 'losango': quadroClass = qcLosango; break;
            default: quadroClass = qcNone;
        }
        const quadro = quadroNovo(x, y, id);
        setHeight(quadro, def.height);
        setWidth(quadro, def.width);
        setText(quadro, def.text);
        setFormat(quadro, def.format);
    }

    setas = [];
    const _setas = model[3 + len];
    for (let i = 0; i < _setas.length; i++) {
        quadro1 = byId(_setas[i].de);
        quadro2 = byId(_setas[i].para);
        const text  = _setas[i].text;
        const color = _setas[i].color;

        const seta  = novaSeta(_setas[i].id);
        const item = getItemSeta(seta);
        item.text = text;
        item.color = color;
        posiciona_seta(seta, quadro1, quadro2);
    }

    num_quadro = n;
    modoMouse = mmNormal;
    modoArrasto = maNone;
    quadroClass = qcNone;
    quadro1 = null;
    quadro2 = null;
    modoAmostra = false;
    seta1 = null;
}

function close_model() {
    clear();
    num_quadro = 0;
    num_seta = 0;
    modoMouse = mmNormal;
    modoArrasto = maNone;
    quadroClass = qcNone;
    quadro1 = null;
    quadro2 = null;
    modoAmostra = false;
    seta1 = null;
    filename = '';
    last_file = '';
}
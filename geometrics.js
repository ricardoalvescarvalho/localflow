function catetosParaAngulo(oposto, adjacente) {
    let angulo;

    angulo = radToDeg(Math.atan2(oposto, adjacente));
    while (angulo < 0)
        angulo += 360;
    
    return angulo;
}

function degToRad(deg) {
    return deg / (180 / Math.PI);
}

function radToDeg(rad) {
    return rad * 180 / Math.PI;
}

//argumentos dever ser um objeto {x, y}
function pontosParaAngulo(a, b) {
    const oposto = a.y - b.y;
    const adjacente = b.x - a.x;
    return catetosParaAngulo(oposto, adjacente);
}

function distancia(a, b) {
    return Math.hypot(b.x - a.x, a.y - b.y);
}

function equacao_reta(ptA, ptB) {
    let a, b, c; //ax + by + c = 0
    const m = (ptA.y - ptB.y) / (ptA.x - ptB.x); //coeficiente angular
    a = m;
    b = 1;
    c = -(-ptA.y + m * ptA.x);
    return {'a':a, 'b':b, 'c':c}
}

//a e b são [{x,y}, {x,y}]
function ponto_cruzamento(a, b) {
    const eqa = equacao_reta(a[0], a[1]);
    const eqb = equacao_reta(b[0], b[1]);
    let x;
    if (a[0].x == a[1].x)
        x = a[0].x;
    else if (b[0].x == b[1].x)
        x = b[0].x;
    else
        x = (eqa.c - eqb.c) / (eqb.a - eqa.a);
    const y = -(-eqa.a * x - eqa.c);
    return {'x':x, 'y':y};
}

function between(x, a, b) {
    return x >= a && x <= b;
}

function ponto_no_retangulo(ponto, retangulo) {
    return between(ponto.x, retangulo[0].x, retangulo[1].x) &&
        between(ponto.y, retangulo[0].y, retangulo[1].y); 
}

function centro_retangulo(retangulo) {
    const x = (retangulo[1].x - retangulo[0].x) / 2 + retangulo[0].x;
    const y = (retangulo[1].y - retangulo[0].y) / 2 + retangulo[0].y;
    return {'x':x, 'y':y};
}

function cruzamento_seta_retangulo(seta, retangulo, outro_quadro) {
    const top = [{'x':retangulo[0].x, 'y':retangulo[0].y}, {'x':retangulo[1].x, 'y':retangulo[0].y}];
    const bot = [{'x':retangulo[0].x, 'y':retangulo[1].y}, {'x':retangulo[1].x, 'y':retangulo[1].y}];
    const lef = [{'x':retangulo[0].x, 'y':retangulo[0].y}, {'x':retangulo[0].x, 'y':retangulo[1].y}];
    const rig = [{'x':retangulo[1].x, 'y':retangulo[0].y}, {'x':retangulo[1].x, 'y':retangulo[1].y}];
    const p1 = ponto_cruzamento(seta, top);
    const p2 = ponto_cruzamento(seta, bot);
    const p3 = ponto_cruzamento(seta, lef);
    const p4 = ponto_cruzamento(seta, rig);
    const center = centro(outro_quadro);
    let pontos = [];
    if (ponto_no_retangulo(p1, retangulo))
        pontos.push(p1);
    if (ponto_no_retangulo(p2, retangulo))
        pontos.push(p2);
    if (ponto_no_retangulo(p3, retangulo))
        pontos.push(p3);
    if (ponto_no_retangulo(p4, retangulo))
        pontos.push(p4);

    const result = pontos.map((valor) => {
        return {'ponto': valor, 'distancia': distancia(valor, center)};
    }).reduce((menor, item) => {
        if (item.distancia < menor.distancia)
            menor = item;
        return menor;
    }).ponto;
    return result;
}

function meio(a, b) {
    const menor = a < b ? a : b;
    const maior = a >= b ? a : b;  
    return (maior - menor) / 2 + menor;
}

function cruzamento_seta_losango(seta, losango, quadro_oposto) {
    const eixoX = meio(losango[0].x, losango[1].x);
    const eixoY = meio(losango[0].y, losango[1].y);

    const p1 = {'x': losango[0].x, 'y': eixoY};
    const p2 = {'x': eixoX, 'y': losango[0].y};
    const p3 = {'x': losango[1].x, 'y': eixoY};
    const p4 = {'x': eixoX, 'y': losango[1].y};

    const tl = [p1, p2];
    const tr = [p2, p3];
    const bl = [p1, p4];
    const br = [p4, p3];

    const c1 = ponto_cruzamento(seta, tl);
    const c2 = ponto_cruzamento(seta, tr);
    const c3 = ponto_cruzamento(seta, bl);
    const c4 = ponto_cruzamento(seta, br);
    const center = centro(quadro_oposto);

    let pontos = [];
    if (ponto_no_retangulo(c1, losango))
        pontos.push(c1);
    if (ponto_no_retangulo(c2, losango))
        pontos.push(c2);
    if (ponto_no_retangulo(c3, losango))
        pontos.push(c3);
    if (ponto_no_retangulo(c4, losango))
        pontos.push(c4);

    const result = pontos.map((valor) => {
        return {'ponto': valor, 'distancia': distancia(valor, center)};
    }).reduce((menor, item) => {
        if (item.distancia < menor.distancia)
            menor = item;
        return menor;
    }).ponto;
    return result;
}


function centro(quadro) {
    const w = quadro.offsetWidth;
    const h = quadro.offsetHeight;
    let x = quadro.offsetLeft + w / 2;
    let y = quadro.offsetTop + h / 2;
    return {'x': x, 'y': y};
}

function centroSeta(p1, p2) {
    const x = (p2.x - p1.x) / 2 + p1.x;
    const y = (p2.y - p1.y) / 2 + p1.y;
    return {'x': x, 'y': y};
}


function ponto_em_redim_vert(ponto, quadro) {
    //ponto do quadro
    const x = quadro.offsetWidth / 2;
    const y = quadro.offsetHeight;
    const offset = 6;
    
    const area = [{'x':x-offset, 'y':y-2*offset}, {'x':x+offset, 'y':y}];
    return ponto_no_retangulo(ponto, area);
}

function ponto_em_redim_horz(ponto, quadro) {
    //ponto do quadro
    const x = quadro.offsetWidth;
    const y = quadro.offsetHeight / 2;
    const offset = 6;
    
    const area = [{'x':x-2*offset, 'y':y-offset}, {'x':x, 'y':y+offset}];
    return ponto_no_retangulo(ponto, area);
}

function ponto_em_redim_diag(ponto, quadro) {
    let x, y, area;
    const offset = 6; 
    const tipo = tipo_quadro(quadro);
    switch (tipo) {
        case 'circulo':
            const w = quadro.offsetWidth / 2;
            const h = quadro.offsetHeight / 2;
            const seno = Math.sin(degToRad(45));
            x = seno * w + w;
            y = seno * h + h;
            area = [{'x': x-2*offset,'y': y-2*offset}, {'x': x+offset,'y': y+offset}];
            break;
        case 'losango':
            x = quadro.offsetWidth * 0.75;
            y = quadro.offsetHeight * 0.75;
            area = [{'x': x-offset,'y': y-offset}, {'x': x+offset,'y': y+offset}];
            break;             
        case 'quadrado':
            x = quadro.offsetWidth;
            y = quadro.offsetHeight;
            area = [{'x': x-2*offset,'y': y-2*offset}, {'x': x,'y': y}];
            break;       
    }
    return ponto_no_retangulo(ponto, area);
}
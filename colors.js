function nameToRGB(name) {
    let fakeDiv = document.createElement("div");
    fakeDiv.style.color = name;
    document.body.appendChild(fakeDiv);
  
    const cs = window.getComputedStyle(fakeDiv);
    const pv = cs.getPropertyValue("color");
  
    document.body.removeChild(fakeDiv);
  
    return pv;
}

function RGBToHex(rgb) {
    let sep = rgb.indexOf(",") > -1 ? "," : " ";
    // "rgb(r,g,b)" -> [r,g,b]
    rgb = rgb.substr(4).split(")")[0].split(sep);
  
    let r = (+rgb[0]).toString(16),
        g = (+rgb[1]).toString(16),
        b = (+rgb[2]).toString(16);
  
    if (r.length == 1)
      r = "0" + r;
    if (g.length == 1)
      g = "0" + g;
    if (b.length == 1)
      b = "0" + b;
  
    return "#" + r + g + b;
}

function nameToHex(name) {
    let fakeDiv = document.createElement("div");
    fakeDiv.style.color = name;
    document.body.appendChild(fakeDiv);
  
    let cs = window.getComputedStyle(fakeDiv),
        pv = cs.getPropertyValue("color");
  
    document.body.removeChild(fakeDiv);
  
    let rgb = pv.substr(4).split(")")[0].split(","),
        r = (+rgb[0]).toString(16),
        g = (+rgb[1]).toString(16),
        b = (+rgb[2]).toString(16);
  
    if (r.length == 1)
      r = "0" + r;
    if (g.length == 1)
      g = "0" + g;
    if (b.length == 1)
      b = "0" + b;
  
    return "#" + r + g + b;
}

function colorToHex(color) {
    if (color[0] == 'r')
        return RGBToHex(color);
    else if (color[0] == '#') {
        if (color.length == 4)
            return color + color.substr(1, 5);
        else
            return color;
    }
    else
        return nameToHex(color);
}

function getBackgroundColor(element, pseudo) {
    const cs = window.getComputedStyle(element, pseudo);
    const pv = cs.getPropertyValue("background-color");
    return RGBToHex(pv);
}

function getBorderColor(element) {
    const cs = window.getComputedStyle(element);
    const pv = cs.getPropertyValue("border-color");
    return RGBToHex(pv);
}

function getColor(element) {
    const cs = window.getComputedStyle(element);
    const pv = cs.getPropertyValue("color");
    return RGBToHex(pv);
}

function getColorSeta(seta) {
    const item = getItemSeta(seta);
    return item.color;
}

function getSetaTextWidth(seta) {
    const cs = window.getComputedStyle(seta, 'after');
    const pv = cs.getPropertyValue("width");
    const w = pv.substring(0, pv.length-2);
    return Math.ceil(w);
}

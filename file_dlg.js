var callback_function;
var content;
var last_file = "";

function enableOk(enabled) {
    const ok = document.querySelector(
        "#divModal > div > div.modal-footer > div.button-place > input:nth-child(1)");
    ok.disabled = !enabled;
}

function readSingleFile(e) {
    var file = e.target.files[0];
    if (!file) {
        return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
        content = e.target.result;
    };
    reader.readAsText(file);
    enableOk(true);
    last_file = file.name;
}

function file_dlg_execute(callback) {
    let html = '<input type="file" id="file-input" style="margin: 40px auto 40px auto; border: none;" />';

    callback_function = callback;
    showModal(
        'Abrir',
        html,
        null,
        ["OK", "Cancelar"],
        'call_callback'
    );
    document.getElementById('file-input').addEventListener(
        'change', readSingleFile, false);
    enableOk(false);
}

function call_callback(button) {
    if (button == "OK") {
        callback_function(content);
        filename = last_file;
    }
}
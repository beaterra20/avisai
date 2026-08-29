const titulo = document.getElementById("titulo");
const descricao = document.getElementById("descricao");
const opcoesUrgencia = document.querySelectorAll('input[name="urgencia"]');

const localizacaoTexto = document.getElementById("localizacao-texto");
const btnPublicar = document.getElementById("btn-publicar");
const erroDescricao = document.getElementById("erro-descricao");

let latitude = null;
let longitude = null;

/* =========================
   LOCALIZAÇÃO
========================= */

function obterLocalizacao() {

    if (!navigator.geolocation) {
        localizacaoTexto.textContent = "Localização não disponível";
        validarFormulario();
        return;
    }

    localizacaoTexto.textContent = "Obtendo localização...";

    navigator.geolocation.getCurrentPosition(
        localizacaoObtida,
        erroLocalizacao
    );
}

function localizacaoObtida(posicao) {

    latitude = posicao.coords.latitude;
    longitude = posicao.coords.longitude;

    console.log("Latitude:", latitude);
    console.log("Longitude:", longitude);

    localizacaoTexto.textContent = "Localização atual";

    validarFormulario();
}

function erroLocalizacao(erro) {

    console.error("Erro ao obter localização:", erro);

    latitude = null;
    longitude = null;

    if (erro.code === erro.PERMISSION_DENIED) {
        localizacaoTexto.textContent = "Permissão de localização negada";
    }

    else if (erro.code === erro.POSITION_UNAVAILABLE) {
        localizacaoTexto.textContent = "Localização indisponível";
    }

    else if (erro.code === erro.TIMEOUT) {
        localizacaoTexto.textContent = "Tempo limite excedido";
    }

    else {
        localizacaoTexto.textContent = "Não foi possível obter a localização";
    }

    validarFormulario();
}

/* =========================
   VALIDAÇÃO
========================= */

function validarFormulario() {

    const tituloValido =
        titulo.value.trim().length > 0;

    const descricaoValida =
        descricao.value.trim().length >= 10;

    const urgenciaSelecionada =
        document.querySelector('input[name="urgencia"]:checked');

    const localizacaoValida =
        latitude !== null &&
        longitude !== null;

    if (
        tituloValido &&
        descricaoValida &&
        urgenciaSelecionada &&
        localizacaoValida
    ) {
        btnPublicar.disabled = false;
    }

    else {
        btnPublicar.disabled = true;
    }
}

/* =========================
   DESCRIÇÃO
========================= */

descricao.addEventListener("input", function () {

    const quantidadeCaracteres =
        descricao.value.trim().length;

    if (
        quantidadeCaracteres > 0 &&
        quantidadeCaracteres < 10
    ) {
        erroDescricao.textContent =
            "A descrição deve ter pelo menos 10 caracteres.";
    }

    else {
        erroDescricao.textContent = "";
    }

    validarFormulario();
});

/* =========================
   TÍTULO
========================= */

titulo.addEventListener(
    "input",
    validarFormulario
);

/* =========================
   URGÊNCIA
========================= */

opcoesUrgencia.forEach(function (opcao) {

    opcao.addEventListener(
        "change",
        validarFormulario
    );

});

/* =========================
   INICIALIZAÇÃO
========================= */

obterLocalizacao();

validarFormulario();

/* =========================
   PUBLICAR ALERTA
========================= */

const formAlerta = document.getElementById("form-alerta");
const mensagemAlerta = document.getElementById("mensagem-alerta");

formAlerta.addEventListener("submit", async function (event) {

    event.preventDefault();

    validarFormulario();

    if (btnPublicar.disabled) {
        return;
    }

    btnPublicar.disabled = true;
    btnPublicar.textContent = "Publicando...";

    mensagemAlerta.textContent = "";

    try {

        // Busca o usuário que está logado
        const {
            data: { user },
            error: usuarioError
        } = await supabaseClient.auth.getUser();

        if (usuarioError || !user) {
            console.error("Erro ao identificar usuário:", usuarioError);

            mensagemAlerta.textContent =
                "Não foi possível identificar o usuário.";

            return;
        }

        const urgenciaSelecionada =
            document.querySelector(
                'input[name="urgencia"]:checked'
            );

        // Cria o alerta no banco
        const {
            error: alertaError
        } = await supabaseClient
            .from("alertas")
            .insert({
                usuario_id: user.id,
                titulo: titulo.value.trim(),
                descricao: descricao.value.trim(),
                urgencia: urgenciaSelecionada.value,
                latitude: latitude,
                longitude: longitude
            });

        if (alertaError) {
            console.error(
                "Erro ao publicar alerta:",
                alertaError
            );

            mensagemAlerta.textContent =
                "Não foi possível publicar o alerta.";

            return;
        }

        // Publicação concluída
        window.location.href = "feed.html";

    }

    catch (erro) {

        console.error(
            "Erro inesperado ao publicar:",
            erro
        );

        mensagemAlerta.textContent =
            "Ocorreu um erro ao publicar o alerta.";

    }

    finally {

        btnPublicar.textContent = "Publicar";

        validarFormulario();
    }

});
const btnContinuar = document.getElementById("btn-continuar");
const dadosCadastro = document.getElementById("dados-cadastro");
const etapaSenha = document.getElementById("etapa-senha");
const formCadastro = document.getElementById("form-cadastro");
const campoCep = document.getElementById("cep");
const btnVoltarSenha = document.getElementById("btn-voltar-senha");
const campoSenha = document.getElementById("senha");

const reqTamanho = document.getElementById("req-tamanho");
const reqMaiuscula = document.getElementById("req-maiuscula");
const reqNumero = document.getElementById("req-numero");
const reqEspecial = document.getElementById("req-especial");
const mensagem = document.getElementById("mensagem");

campoCep.addEventListener("input", () => {
    const numeros = campoCep.value.replace(/[^0-9]/g, "").slice(0, 8);

    campoCep.value =
        numeros.length > 5
            ? `${numeros.slice(0, 5)}-${numeros.slice(5)}`
            : numeros;
});

btnContinuar.addEventListener("click", async function () {
    esconderMensagem();
    
    const nome = document.getElementById("nome").value.trim();
    const sobrenome = document.getElementById("sobrenome").value.trim();
    const cep = document.getElementById("cep").value.trim();
    const email = document.getElementById("email").value.trim();

   if (!nome || !sobrenome || !cep || !email) {
        mostrarMensagem("Preencha todos os campos obrigatórios.");
        return;
    }

    if (nome.length < 3) {
        mostrarMensagem("O nome precisa ter pelo menos 3 caracteres.");
        return;
    }

    if (sobrenome.length < 3) {
        mostrarMensagem("O sobrenome precisa ter pelo menos 3 caracteres.");
        return;
    } 

    const cepNumerico = Number(cep.replace(/\D/g, ""));

    if (cepNumerico.toString().length !== 8) {
        mostrarMensagem("Informe um CEP válido com 8 números.");
        return;
    }

    const { data: regioes, error } = await supabaseClient
        .from("areas_cobertura")
        .select("id")
        .lte("cep_inicial", cepNumerico)
        .gte("cep_final", cepNumerico)
        .eq("ativo", true)
        .limit(1);

    if (error) {
        console.error(error);
        mostrarMensagem("Não foi possível validar o CEP.");
        return;
    }

    if (!regioes || regioes.length === 0) {
        mostrarMensagem("O serviço ainda não está disponível para a região informada.");
        return;
    }

    dadosCadastro.style.display = "none";
    etapaSenha.style.display = "flex";
});

btnVoltarSenha.addEventListener("click", function () {
    etapaSenha.style.display = "none";
    dadosCadastro.style.display = "block";
});


formCadastro.addEventListener("submit", async function (event) {
    event.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const sobrenome = document.getElementById("sobrenome").value.trim();
    const cep = document.getElementById("cep").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;
    const confirmarSenha =
        document.getElementById("confirmar-senha").value;

     if (nome.length < 3) {
    mostrarMensagem("O nome precisa ter pelo menos 3 caracteres.");
    return;
}

if (sobrenome.length < 3) {
    mostrarMensagem("O sobrenome precisa ter pelo menos 3 caracteres.");
    return;
}   

    if (senha !== confirmarSenha) {
        mostrarMensagem("As senhas não são iguais.");
        return;
    }

    const senhaValida =
        senha.length >= 8 &&
        /[A-Z]/.test(senha) &&
        /[0-9]/.test(senha) &&
        /[^A-Za-z0-9]/.test(senha);

    if (!senhaValida) {
        mostrarMensagem(
            "A senha precisa ter pelo menos 8 caracteres, uma letra maiúscula, um número e um caractere especial."
        );
        return;
    }

    const { error } = await supabaseClient.auth.signUp({
        email,
    password: senha,
    options: {
        emailRedirectTo:
            "https://beaterra20.github.io/avisai/confirmação-conta.html",

        data: {
            nome,
            sobrenome,
            cep
        }
    }
});

    if (error) {
        console.error(error);
        mostrarMensagem("Erro ao criar conta: " + error.message);
        return;
    }

    window.location.href = "aguardando-confirmacao.html";
});

campoSenha.addEventListener("input", () => {

    const senha = campoSenha.value;

    atualizarRequisito(reqTamanho, senha.length >= 8);

    atualizarRequisito(reqMaiuscula, /[A-Z]/.test(senha));

    atualizarRequisito(reqNumero, /[0-9]/.test(senha));

    atualizarRequisito(reqEspecial, /[^A-Za-z0-9]/.test(senha));

});
function atualizarRequisito(item, valido){

    if(valido){

        item.textContent = "✅ " + item.textContent.replace("✅ ","").replace("❌ ","");

        item.style.color = "#1B8F3A";

    }else{

        item.textContent = "❌ " + item.textContent.replace("✅ ","").replace("❌ ","");

        item.style.color = "#B42318";

    }

}
function mostrarMensagem(texto){

    mensagem.textContent = texto;
    mensagem.style.display = "block";

}

function esconderMensagem(){

    mensagem.textContent = "";
    mensagem.style.display = "none";

} 

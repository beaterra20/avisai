const formLogin = document.getElementById("form-login");
const mensagemLogin = document.getElementById("mensagem-login");

formLogin.addEventListener("submit", async function (event) {
    event.preventDefault();

    esconderMensagem();

    const email = document
        .getElementById("email")
        .value
        .trim();

    const senha = document
        .getElementById("senha")
        .value;

    if (!email || !senha) {
        mostrarMensagem(
            "Informe o e-mail e a senha.",
            "erro"
        );

        return;
    }

    const {
        data,
        error
    } = await supabaseClient.auth.signInWithPassword({
        email,
        password: senha
    });

    if (error) {
        console.error(error);

        mostrarMensagem(
            "E-mail ou senha inválidos.",
            "erro"
        );

        return;
    }

    if (!data.user) {
        mostrarMensagem(
            "Não foi possível acessar sua conta.",
            "erro"
        );

        return;
    }

    /* Verifica o status do perfil */

    const {
        data: perfil,
        error: perfilError
    } = await supabaseClient
        .from("perfis")
        .select("status")
        .eq("id", data.user.id)
        .single();

    if (perfilError) {
        console.error(perfilError);

        mostrarMensagem(
            "Não foi possível verificar sua conta.",
            "erro"
        );

        return;
    }

    if (perfil.status === "Pendente") {
        await supabaseClient.auth.signOut();

        mostrarMensagem(
            "Seu e-mail ainda não foi confirmado. Confirme sua conta antes de entrar.",
            "erro"
        );

        return;
    }

    window.location.href = "feed.html";
});


function mostrarMensagem(texto, tipo) {
    mensagemLogin.textContent = texto;
    mensagemLogin.style.display = "block";

    if (tipo === "erro") {
        mensagemLogin.style.backgroundColor = "#FDECEC";
        mensagemLogin.style.color = "#B42318";
        mensagemLogin.style.border = "1px solid #F2B8B5";
    }
}


function esconderMensagem() {
    mensagemLogin.textContent = "";
    mensagemLogin.style.display = "none";
}
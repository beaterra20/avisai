async function carregarFeed() {

    const avatarUsuario =
        document.getElementById("avatar-usuario");

    const feedVazio =
        document.getElementById("feed-vazio");

    /* =========================
       USUÁRIO AUTENTICADO
    ========================= */

    const {
        data: { user },
        error: usuarioError
    } = await supabaseClient.auth.getUser();

    if (usuarioError || !user) {

        console.error(
            "Usuário não autenticado:",
            usuarioError
        );

        window.location.href = "login.html";
        return;
    }

    /* =========================
       PERFIL DO USUÁRIO
    ========================= */

    const {
        data: perfil,
        error: perfilError
    } = await supabaseClient
        .from("perfis")
        .select("nome, sobrenome, cep")
        .eq("id", user.id)
        .single();

    if (perfilError || !perfil) {

        console.error(
            "Erro ao carregar perfil:",
            perfilError
        );

        return;
    }

    /* =========================
       INICIAIS DO AVATAR
    ========================= */

    const inicialNome = perfil.nome
        ? perfil.nome.trim().charAt(0).toUpperCase()
        : "";

    const inicialSobrenome = perfil.sobrenome
        ? perfil.sobrenome.trim().charAt(0).toUpperCase()
        : "";

    avatarUsuario.textContent =
        `${inicialNome}${inicialSobrenome}` || "?";

    /* =========================
       BUSCAR ALERTAS
    ========================= */

    const {
        data: alertas,
        error: alertasError
    } = await supabaseClient
        .from("alertas")
        .select("*")
        .order("created_at", {
            ascending: false
        });

    if (alertasError) {

        console.error(
            "Erro ao carregar alertas:",
            alertasError
        );

        return;
    }

    console.log(
        "Alertas encontrados:",
        alertas
    );

    /* =========================
       ESTADO DO FEED
    ========================= */

    if (alertas.length === 0) {

    feedVazio.style.display = "flex";

    return;
}

feedVazio.style.display = "none";

const feedAlertas =
    document.getElementById("feed-alertas");

feedAlertas.innerHTML = "";

alertas.forEach(function (alerta) {

    const card = document.createElement("article");

    card.classList.add("alerta-card");

    card.innerHTML = `
        <div class="alerta-card-topo">

            <h2>
                ${alerta.titulo}
            </h2>

            <span class="alerta-urgencia">
                ${alerta.urgencia}
            </span>

        </div>

        <p class="alerta-descricao">
            ${alerta.descricao}
        </p>

        <div class="alerta-localizacao">
            📍 Localização atual
        </div>
    `;

    feedAlertas.appendChild(card);
});

}

carregarFeed();
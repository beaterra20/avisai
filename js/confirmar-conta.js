async function ativarConta() {
    const titulo = document.getElementById("titulo-confirmacao");
    const mensagem = document.getElementById("mensagem-confirmacao");

    // O Supabase pode enviar erros depois do símbolo # na URL.
    const parametrosHash = new URLSearchParams(
        window.location.hash.substring(1)
    );

    // No fluxo PKCE, o código normalmente chega depois do símbolo ?.
    const parametrosQuery = new URLSearchParams(
        window.location.search
    );

    const erroCodigo =
        parametrosHash.get("error_code") ||
        parametrosQuery.get("error_code");

    const erroDescricao =
        parametrosHash.get("error_description") ||
        parametrosQuery.get("error_description");

    const codigo = parametrosQuery.get("code");

    // Primeiro: tratar link expirado ou inválido.
    if (
        erroCodigo === "otp_expired" ||
        erroCodigo === "access_denied" ||
        erroDescricao?.toLowerCase().includes("expired") ||
        erroDescricao?.toLowerCase().includes("invalid")
    ) {
        titulo.textContent = "Link expirado";

        mensagem.innerHTML = `
            Este link de confirmação expirou ou já foi utilizado.
            <br><br>
            <a href="reenviar-confirmacao.html">
                Reenviar e-mail de confirmação
            </a>
        `;

        return;
    }

    // Sem código, não devemos usar uma sessão antiga como confirmação.
    if (!codigo) {
        titulo.textContent = "Não foi possível confirmar sua conta";

        mensagem.innerHTML = `
            O link de confirmação é inválido ou está incompleto.
            <br><br>
            <a href="reenviar-confirmacao.html">
                Reenviar e-mail de confirmação
            </a>
        `;

        return;
    }

    // Troca exclusivamente o código deste link por uma sessão.
    const {
        data: dadosSessao,
        error: trocaError
    } = await supabaseClient.auth.exchangeCodeForSession(codigo);

    if (trocaError || !dadosSessao?.user) {
        console.error(trocaError);

        titulo.textContent = "Link expirado";

        mensagem.innerHTML = `
            Não foi possível confirmar sua conta.
            O link pode ter expirado ou já ter sido utilizado.
            <br><br>
            <a href="reenviar-confirmacao.html">
                Reenviar e-mail de confirmação
            </a>
        `;

        return;
    }

    const usuario = dadosSessao.user;

    const { error: perfilError } = await supabaseClient
        .from("perfis")
        .update({ status: "Ativa" })
        .eq("id", usuario.id)
        .eq("status", "Pendente");

    if (perfilError) {
        console.error(perfilError);

        titulo.textContent = "E-mail confirmado";
        mensagem.textContent =
            "Seu e-mail foi confirmado, mas não foi possível atualizar o status da conta.";

        return;
    }

    titulo.textContent = "Conta ativada com sucesso!";
    mensagem.textContent =
        "Seu e-mail foi confirmado e sua conta está ativa.";
}

ativarConta();

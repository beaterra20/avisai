async function ativarConta() {
    const titulo = document.getElementById("titulo-confirmacao");
    const mensagem = document.getElementById("mensagem-confirmacao");

    const hashConfirmacao =
        window.hashConfirmacaoOriginal || window.location.hash;

    const parametrosHash = new URLSearchParams(
        hashConfirmacao.substring(1)
    );

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
    const accessToken = parametrosHash.get("access_token");
    const refreshToken = parametrosHash.get("refresh_token");
    const tokenHash = parametrosQuery.get("token_hash");
    const tipo = parametrosQuery.get("type");

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

    let usuario = null;

    // Se o link veio com token_hash
if (tokenHash && tipo) {
    const { data: dadosOtp, error: otpError } =
        await supabaseClient.auth.verifyOtp({
            token_hash: tokenHash,
            type: tipo
        });

    if (otpError || !dadosOtp?.user) {
        console.error("Erro ao confirmar token:", otpError);

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

    usuario = dadosOtp.user;
}

// Se o Supabase enviou um código PKCE
else if (codigo) {
    const {
        data: dadosSessao,
        error: trocaError
    } = await supabaseClient.auth.exchangeCodeForSession(codigo);

    if (trocaError || !dadosSessao?.user) {
        console.error(trocaError);

        titulo.textContent = "Não foi possível confirmar sua conta";
        mensagem.innerHTML = `
            O link de confirmação é inválido ou expirou.
            <br><br>
            <a href="reenviar-confirmacao.html">
                Reenviar e-mail de confirmação
            </a>
        `;

        return;
    }

    usuario = dadosSessao.user;
}

// Se o Supabase enviou os tokens pelo #
else if (accessToken && refreshToken) {
    const {
        data: dadosSessao,
        error: sessaoError
    } = await supabaseClient.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
    });

    if (sessaoError || !dadosSessao?.user) {
        console.error(sessaoError);

        titulo.textContent = "Não foi possível confirmar sua conta";
        mensagem.innerHTML = `
            O link de confirmação é inválido ou expirou.
            <br><br>
            <a href="reenviar-confirmacao.html">
                Reenviar e-mail de confirmação
            </a>
        `;

        return;
    }

    usuario = dadosSessao.user;
}

// Se não veio nem código nem tokens
else {
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

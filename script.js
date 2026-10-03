let modo = "nome";
let banco = [];

const nomeTab = document.getElementById("nomeTab");
const cpfTab = document.getElementById("cpfTab");
const busca = document.getElementById("busca");
const pesquisar = document.getElementById("pesquisar");
const resultados = document.getElementById("resultados");
const status = document.getElementById("status");


function normalizar(texto) {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}


function limparCPF(texto) {
    return texto.replace(/\D/g, "");
}


function interpretarLinha(linha) {

    linha = linha.trim();

    if (!linha.startsWith("(") || !linha.endsWith(")")) {
        return null;
    }

    linha = linha.slice(1, -1);

    const partes = linha.split(",");

    if (partes.length < 4) {
        return null;
    }

    const cpf = partes[0].trim();
    const nascimento = partes.at(-1).trim();
    const genero = partes.at(-2).trim();

    const nome = partes
        .slice(1, -2)
        .join(",")
        .trim();

    return {
        cpf,
        nome,
        genero,
        nascimento
    };
}


// Carrega banco.txt automaticamente
async function carregarBanco() {

    try {

        const resposta = await fetch("banco.txt");

        if (!resposta.ok) {
            throw new Error("Arquivo não encontrado.");
        }

        const texto = await resposta.text();

        banco = texto
            .split(/\r?\n/)
            .map(interpretarLinha)
            .filter(Boolean);

        status.textContent =
            `${banco.length.toLocaleString("pt-BR")} registros carregados.`;

    } catch (erro) {

        status.textContent =
            "Erro ao carregar banco.txt.";
    }
}


// Aba Nome
nomeTab.addEventListener("click", () => {

    modo = "nome";

    nomeTab.classList.add("ativa");
    cpfTab.classList.remove("ativa");

    busca.placeholder = "Digite o nome";
});


// Aba CPF
cpfTab.addEventListener("click", () => {

    modo = "cpf";

    cpfTab.classList.add("ativa");
    nomeTab.classList.remove("ativa");

    busca.placeholder = "Digite o CPF";
});


// Pesquisa
pesquisar.addEventListener("click", () => {

    const termo = busca.value.trim();

    if (!termo) {
        resultados.innerHTML = "<p>Digite algo para pesquisar.</p>";
        return;
    }

    let encontrados;

    if (modo === "cpf") {

        const cpf = limparCPF(termo);

        encontrados = banco.filter(pessoa =>
            limparCPF(pessoa.cpf) === cpf
        );

    } else {

        const nome = normalizar(termo);

        encontrados = banco.filter(pessoa =>
            normalizar(pessoa.nome).includes(nome)
        );
    }

    mostrarResultados(encontrados);
});


function mostrarResultados(lista) {

    resultados.innerHTML = "";

    if (lista.length === 0) {

        resultados.innerHTML =
            "<p>Nenhum resultado encontrado.</p>";

        return;
    }

    for (const pessoa of lista) {

        const div = document.createElement("div");

        div.className = "pessoa";

        div.innerHTML = `
            <div><strong>CPF:</strong> ${escapar(pessoa.cpf)}</div>
            <div><strong>Nome:</strong> ${escapar(pessoa.nome)}</div>
            <div><strong>Gênero:</strong> ${escapar(pessoa.genero)}</div>
            <div><strong>Nascimento:</strong> ${escapar(pessoa.nascimento)}</div>
        `;

        resultados.appendChild(div);
    }
}


function escapar(texto) {

    const div = document.createElement("div");

    div.textContent = texto;

    return div.innerHTML;
}


carregarBanco();
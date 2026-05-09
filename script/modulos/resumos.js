const conteudo = document.getElementById('conteudo-pagina');
conteudo.innerHTML = ''

const dadosCards = [
    {   nome: 'saldo',
        id: 'card-saldo',
        titulo: 'SALDO',
        valor: 'R$ 500,00',
        rodape: 'no periodo',
        classeValor: '' 
    },
    {
        nome: 'receita',
        id: 'card-receita',
        titulo: 'RECEITAS',
        valor: 'R$ 1000,00',
        rodape: 'vs mês anterior',
        classeValor: 'txt-receita' 
    },
    {
        nome: 'despesa',
        id: 'card-despesa',
        titulo: 'DESPESAS',
        valor: 'R$ 500,00',
        rodape: 'vs mês anterior',
        classeValor: 'txt-despesa'
    },
    {
        nome: 'nubank',
        id: 'card-nubank',
        titulo: 'NUBANK',
        valor: 'R$ 500,00',
        rodape: 'vs mês anterior',
        classeValor: ''// 'txt-despesa'
    },
    {
        nome: 'merc-pago',
        id: 'card-merc-pago',
        titulo: 'MERCADO PAGO',
        valor: 'R$ 500,00',
        rodape: 'vs mês anterior',
        classeValor: 'txt-despesa'
    },
];

export function renderizaResumos(){
    conteudo.innerHTML = `${cabecalhoConteudo()}`;
    conteudo.appendChild(cardsResumo());
    conteudo.innerHTML += `${categoria()}`;
    conteudo.innerHTML += `${lancRecentes()}`;

}

function cabecalhoConteudo() {
   const conteudoCabecalho = `<header id="cabecalho-conteudo">
            <h2 id="titulo-conteudo">Visão Geral</h2>
            <div id="box-periodo">
                <button id="btn-voltar-periodo">&lt</button>
                <p id="descricao-periodo">${retornaPeriodo()}</p>
                <button id="btn-avancar-periodo">&gt</button>
            </div>
    </header>`
    return conteudoCabecalho;
}

function retornaPeriodo() {
    const data = new Date();
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const mes = meses[data.getMonth()];
    const ano = data.getFullYear();
    
    return `${mes} de ${ano}`;
}

function cardsResumo(dados) {
    const containerResumo = document.createElement('section');
    containerResumo.id = 'container-resumo';
    dadosCards.forEach(l => {
       const elementosResumo = `<div id="${l.id}" class="card card-resumo">
            <h3 id="titulo-card-${l}" class="titulo-card">${l.titulo}</h3>
            <p id="info-${l.nome}" class="${l.classeValor} info-card">R$ 500,00</p>
            <footer id="rodape-${l.rodape}" class="rodape-card">no periodo</footer>
        </div>`
        containerResumo.innerHTML+=`${elementosResumo}`

    })
    return containerResumo;
}



function categoria(dados){
    const containerCategoria = `<section id="container-categoria" class="card">
                <header id="cabecalho-card-categoria" class="cabecalho-card">
                    <h3 id="titulo-card-categoria" class="titulo-card">POR CATEGORIA</h3>
                </header>
                <ul id="container-lista-categoria">
                    <li class="lista-categoria">Moradia <span>x%</span></li>
                    <li class="lista-categoria">Alimentação <span>x%</span></li>
                    <li class="lista-categoria">Transporte <span>x%</span></li>
                    <li class="lista-categoria">Lazer <span>x%</span></li>
                    <li class="lista-categoria">Outros <span>x%</span></li>
                </ul>
            </section>`

    return containerCategoria
}


function lancRecentes(dados){
    const containerLancRecente = `<section id="conainer-lanc-recente" class="card">
                <header id="cabecalho-card-lanc-recente" class="cabecalho-card">
                    <h3 id="titulo-card-lanc-recente" class="titulo-card">LANÇAMENTOS RECENTES</h3>
                </header>
                <ul id="container-lista-lanc-recente">
                
                    <li class="lista-lanc-recente">
                        <div id="container-img1" class="img-li-lanc">
                            #
                        </div>
                        <div id="container-descricao1" class="descr-li-lanc">
                            <p id="descr-lanc1" class="descr-lanc">Condominio</p>
                            <p id="descr-categoria1" class="descr-categoria-lanc rodape-card">Moradia - Conta Corrente</p>
                        </div>
                        <div id="container-valor1" class="val-li-lanc-recente">
                            <p id="valor-lanc1" class="valor-lanc txt-despesa">- R$ 600</p>
                            <p id="vecimento-lanc1" class="vencimento-lanc rodape-card">10/05</p>
                        </div>
                    </li>
                </ul>
            </section>`

    return containerLancRecente
}
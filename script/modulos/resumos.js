const conteudo = document.getElementById('conteudo-pagina');
conteudo.innerHTML = ''

var parametros = {
    cards: ['saldo', 'receita', 'nubank', 'mercado-pago']
}

export function renderizaResumos(){
    conteudo.innerHTML = `${cabecalhoConteudo()}`;
    conteudo.appendChild(cardsResumo());
    // console.log(cardsResumo());

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

function cardsResumo() {
    const containerResumo = document.createElement('section');
    containerResumo.id = 'container-resumo';
    parametros.cards.forEach(l => {
       const elementosResumo = `<div id="card-${l}" class="card card-resumo">
            <h3 id="titulo-card-${l}" class="titulo-card">${l.toUpperCase().replace("-", " ")}</h3>
            <p id="info-saldo" class="info-card">R$ 500,00</p>
            <footer id="rodape-${l}" class="rodape-card">no periodo</footer>
        </div>`
        containerResumo.innerHTML+=`${elementosResumo}`

    })
    return containerResumo;
}
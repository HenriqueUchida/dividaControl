import {buscaFaturas} from '../api/api.js'
import {buscaLancamentos} from '../api/api.js'

const conteudo = document.getElementById('conteudo-pagina');
conteudo.innerHTML = ''

const dadosCards = [
    {   nome: 'saldo',
        id: 'card-saldo',
        titulo: 'SALDO',
        valor: 0,
        rodape: 'no periodo',
        classeValor: '' 
    },
    {
        nome: 'receita',
        id: 'card-receita',
        titulo: 'RECEITAS',
        valor: 0,
        rodape: 'vs mês anterior',
        classeValor: 'txt-receita' 
    },
    {
        nome: 'despesa',
        id: 'card-despesa',
        titulo: 'DESPESAS',
        valor: 0,
        rodape: 'vs mês anterior',
        classeValor: 'txt-despesa'
    },
    // {
    //     nome: 'nubank',
    //     id: 'card-nubank',
    //     titulo: 'NUBANK',
    //     valor: 'R$ 500,00',
    //     rodape: 'vs mês anterior',
    //     classeValor: ''// 'txt-despesa'
    // },
    // {
    //     nome: 'merc-pago',
    //     id: 'card-merc-pago',
    //     titulo: 'MERCADO PAGO',
    //     valor: 'R$ 500,00',
    //     rodape: 'vs mês anterior',
    //     classeValor: 'txt-despesa'
    // },
];

function calculaResumosLanc(lancamentos){
    let totalReceitas = 0;
    let totalDespesas = 0;

    lancamentos.forEach(lancamento => {
        const valor = Number(lancamento.valor);

        if(lancamento.tipo === 'RECEITA'){
            totalReceitas += valor;
        } else if(lancamento.tipo === 'DESPESA') {
            totalDespesas += valor;
        }
    });
    return {
        saldo: totalReceitas - totalDespesas,
        receita: totalReceitas,
        despesa: totalDespesas
    };

}


function injetaValoresNosCards(dadosCards, resumo) {
    dadosCards.forEach(card => {
        card.valor = resumo[card.nome];
    });
}

function formataMoeda(valor) {
    return Number(valor).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
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

function retornaPeriodo(dia) {
    const data = new Date();
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const mes = data.getMonth();
    const ano = data.getFullYear();
    const conteudo = ''
    const dataReq = new Date(ano, mes+1, 0);
    const mesFormatado = String(dataReq.getMonth() + 1).padStart(2, '0');
    if(dia == null){
        return `${meses[mes]} de ${ano}`

    } else if(dia == 1){
        return `${ano}-${mesFormatado}-01`

    } else if(dia == 0){
        const dia = String(dataReq.getDate());
        return `${ano}-${mesFormatado}-${dia}`
    }

    return 'Parametro inválido'
}

function cardsResumo(dados) {
    const containerResumo = document.createElement('section');
    containerResumo.id = 'container-resumo';
    dadosCards.forEach(l => {
       const elementosResumo = `<div id="${l.id}" class="card card-resumo">
            <h3 id="titulo-card-${l}" class="titulo-card">${l.titulo}</h3>
            <p id="info-${l.nome}" class="${l.classeValor} info-card">${formataMoeda(l.valor)}</p>
            <footer id="rodape-${l.nome}" class="rodape-card">no periodo</footer>
        </div>`
        containerResumo.innerHTML+=`${elementosResumo}`

    })
    return containerResumo;
}


function cardsResumoCartao(dados){
    const containerPai = document.querySelector('#container-resumo');
    dados.forEach(dado =>{
        const containerCartao = `<div id="card-${dado.descricao.toLowerCase().replace(" ","-")}" class="card card-resumo">
            <h3 id="titulo-card-${dado.descricao.toLowerCase().replace(" ","-")}" class="titulo-card">${dado.descricao.toLowerCase().replace(" ","-")}</h3>
            <p id="info-${dado.descricao.toLowerCase().replace(" ","-")}" class="${dado.descricao.toLowerCase().replace(" ","-")} info-card">${dado.valor_fatura}</p>
            <footer id="rodape-${dado.descricao.toLowerCase().replace(" ","-")}" class="rodape-card">no periodo</footer>
        </div>`
        containerPai.innerHTML += containerCartao;
    })
    return containerPai
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


export async function renderizaResumos(){
    const primeiroDia = retornaPeriodo(1);
    const ultimoDia = retornaPeriodo(0);
    const faturas = await buscaFaturas(primeiroDia, ultimoDia);
    const lancamentos = await buscaLancamentos(primeiroDia, ultimoDia);

    const resumo = calculaResumosLanc(lancamentos);

    injetaValoresNosCards(dadosCards, resumo);


    conteudo.innerHTML = `${cabecalhoConteudo()}`;
    conteudo.appendChild(cardsResumo());
    cardsResumoCartao(faturas);
    conteudo.innerHTML += `${categoria()}`;
    conteudo.innerHTML += `${lancRecentes()}`;
}
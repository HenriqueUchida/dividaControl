import { supabaseClient } from './api/client.js';

function inicioApp(){
    parametros.conteudoPrincipal.textContent = '';
    const cardSaldo = document.createElement('section');
    cardSaldo.id = 'card-saldo';
    parametros.conteudoPrincipal.appendChild(cardSaldo);
    const tituloSaldo = document.createElement('h2');
    cardSaldo.appendChild(tituloSaldo);
    tituloSaldo.textContent = 'Saldo Atual';
    const containerSaldo = document.createElement('div');
    containerSaldo.id = 'container-saldo';
    cardSaldo.append(containerSaldo);
    const txtSaldo = document.createElement('p');
    txtSaldo.id = 'txt-saldo';
    containerSaldo.appendChild(txtSaldo);
    const cifrao = document.createElement('span');
    cifrao.textContent = 'R$'
    containerSaldo.appendChild(cifrao);
    txtSaldo.textContent = '---'; //teste visual
    cardSaldo.className ='bg-white w-full max-w-sm p-8 rounded-3xl shadow-sm border-t-4 border-blue-600 flex flex-col items-center gap-3 hover:shadow-xl transition-all cursor-pointer animate-pulse';containerSaldo.className = 'flex flex-row-reverse items-baseline gap-1';
    tituloSaldo.className = 'text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]';
    txtSaldo.className = 'text-5xl font-black text-slate-800 tracking-tighter';
    cifrao.className = 'text-lg font-bold text-slate-300';
                            


    getSaldo();
}

async function getSaldo() {
    const txtSaldo = document.querySelector('#txt-saldo');
    const cardSaldo = document.querySelector('#card-saldo');

    try {
        const {data: contas, error} = await supabaseClient
        .from('conta_bancaria')
        .select('desc_conta, saldo');

        if (error) throw error;
        // Soma todos os saldos
        const total = contas.reduce((acc, conta) => acc + (conta.saldo || 0), 0);

        // Formata apenas o número para o seu elemento <p>
        txtSaldo.textContent = total.toLocaleString('pt-BR', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        });

        // Remove a animação de carregamento
        cardSaldo.classList.remove('animate-pulse');
        cardSaldo.classList.add('border-t-4', 'border-blue-600');

    } catch (err) {
        console.error('Erro ao popular saldo:', err);
        txtSaldo.textContent = 'Erro';
    }
    
}

function gastosFixos(){
    parametros.conteudoPrincipal.textContent = '';
    const cardGastoFixo = document.createElement('section');
    cardGastoFixo.id = 'container-gastos-fixos';
    const tituloTela = document.createElement('h1');
    tituloTela.textContent = 'FIXOS';
    parametros.conteudoPrincipal.appendChild(tituloTela);
    parametros.conteudoPrincipal.appendChild(cardGastoFixo);

    cardGastoFixo.className = 'grid grid-cols-1 lg:grid-cols-2 gap-8 w-full mt-4';
    tituloTela.className = 'text-4xl font-black text-slate-800 tracking-tight self-start';
    
    
    parametros.natureza.forEach(natureza => {
        
        const containerNatureza = document.createElement('div');
        containerNatureza.id = `container-${natureza.toLowerCase()}`;
        cardGastoFixo.appendChild(containerNatureza);
        const tituloNatureza = document.createElement('h2');
        containerNatureza.appendChild(tituloNatureza);
        tituloNatureza.id = `cabecalho-${natureza.toLowerCase()}`;
        tituloNatureza.textContent = `${natureza}`;
        const listaLancamentos = document.createElement('ul');
        listaLancamentos.id = `lista-${natureza.toLowerCase()}`;
        containerNatureza.appendChild(listaLancamentos);
        // containerNatureza.className = 'w-screen'

        tituloNatureza.className = 'text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 block border-b pb-2';
    });

    getGastosFixos();


}

async function getGastosFixos(){
    const {data: lctos_fixos, error} = await supabaseClient
    .from('lancamento_fixo')
    .select('*')

    if(error) throw error;

    console.log(lctos_fixos);
    const listaReceita = document.querySelector('#lista-receitas');
    const listaDespesa = document.querySelector('#lista-despesas');
    let contadorReceita = 1;
    let contadorDespesa = 1;

    lctos_fixos.forEach((lancamento)=>{
        const isReceita = lancamento.natureza === 'R';
        const corBorda = isReceita ? 'border-emerald-500' : 'border-rose-500';
        const corValor = isReceita ? 'text-emerald-600' : 'text-rose-600';
        
        const descricaoRegistro = lancamento.descricao;
        const valorRegistro = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lancamento.valor_fixo);
        const diaVencimento = lancamento.dia_vencimento;
        
        const elementoLista = document.createElement('li');
        const conteudoLista = document.createElement('div');
        const tituloConteudo = document.createElement('h3');
        tituloConteudo.textContent = descricaoRegistro;

        conteudoLista.appendChild(tituloConteudo);
        elementoLista.appendChild(conteudoLista);

        const containerVencimento = document.createElement('div');
        const txtInformativoDia = document.createElement('div');
        const txtDiaVencimento = document.createElement('div');
        conteudoLista.appendChild(containerVencimento);
        containerVencimento.appendChild(txtInformativoDia);
        containerVencimento.appendChild(txtDiaVencimento);
        txtDiaVencimento.textContent = diaVencimento;


        const containerValor = document.createElement('div');
        const txtValorLancamento = document.createElement('div');
        conteudoLista.appendChild(containerValor);
        containerValor.appendChild(txtValorLancamento);
        txtValorLancamento.textContent = valorRegistro;

        if(lancamento.natureza === 'R'){
            txtInformativoDia.textContent = 'Recebo dia:'
            listaReceita.appendChild(elementoLista);
            elementoLista.id = `card-receita-${contadorReceita++}`;

        } else if(lancamento.natureza === 'D') {
            txtInformativoDia.textContent = 'Vence dia:'
            listaDespesa.appendChild(elementoLista);
            elementoLista.id = `card-despesa-${contadorDespesa++}`;
        }
        elementoLista.className = `bg-white p-7 mb-6 rounded-3xl shadow-sm border-t-4 ${corBorda} grid grid-cols-2 gap-y-6 hover:scale-[1.03] transition-all duration-300`;
        conteudoLista.className = 'col-span-2 text-center border-b border-slate-50 pb-4';
        tituloConteudo.className = 'text-sm font-black text-slate-700 uppercase tracking-widest';
        containerVencimento.className = 'flex flex-col items-start';
        txtInformativoDia.className = 'text-[9px] font-black text-slate-300 uppercase';
        txtDiaVencimento.className = 'text-sm font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-full';
        
        containerValor.className = 'flex flex-col items-end';
        txtValorLancamento.className = `text-2xl font-black ${corValor} font-mono tracking-tighter`;

        
        
    })
}

function lancamentos(){
    console.log('Tela para registrar as depesas e receitas');
}

function relatorios(){
    console.log('Tela para relatorios');
}

function cadastros(){
    console.log('Manutenção dos cadastros (cartão de crédito, tipo de despesa e etc...)')
}

function logout(){
    console.log('Opção para deslogar do sistema');
}

var parametros = {
    conteudoMenu: ['Inicio', 'Gastos Fixos', 'Lancamentos', 'Relatorios', 'Cadastros', 'Sair'],
    menuLateral: document.querySelector('#menu-lateral'),
    abrirMenu: document.querySelector('#btn-abrir'),
    fecharMenu: document.querySelector('#btn-fechar'),
    opcoesMenu: {
        'inicio': inicioApp,
        'gastos-fixos': gastosFixos,
        'lancamentos': lancamentos,
        'relatorios': relatorios,
        'cadastros': cadastros,
        'sair': logout
    },
    conteudoPrincipal: document.querySelector('main'),
    natureza: ['Receitas', 'Despesas'],
    async contaBancoECartao(){
        try {
            const[contas, cartoes] = await Promise.all([
                supabaseClient.from('conta_bancaria').select('*'),
                supabaseClient.from('cartao').select('*')
            ]);
            if (contas.error) throw contas.error;
            if (cartoes.error) throw cartoes.error;

            return{
                listaContas: contas.data,
                listaCartoes: cartoes.data
            }
        } catch (err){
            console.error('Erro ao carregar dados de cartões e contas');
            return {listaContas: [], listaCartoes: []};
        }

    }
};

function criaEventos(e){
    const containerBody = document.querySelector('body');
    containerBody.addEventListener('click', (e) => {
        const idClicado = e.target.id;
        if(e.target.closest('#btn-abrir')) {
            parametros.menuLateral.classList.remove('-translate-x-full');
            parametros.abrirMenu.style.display = 'none';
        }
        if(e.target.closest('#btn-fechar') || (e.target.matches('main')) || (e.target.matches('main *'))){
            escondeMenu()
        }
        const link = e.target.closest('a');
        if (link && parametros.opcoesMenu[link.id]) {
            parametros.opcoesMenu[link.id]();
            escondeMenu();
        }
    })
}

function escondeMenu(){
    const mobile = window.innerWidth < 1024;
    const menuHidden = parametros.menuLateral.classList.contains('hidden') || !parametros.menuLateral.classList.contains('-translate-x-full')
    if(mobile && menuHidden){
        parametros.menuLateral.classList.add('-translate-x-full');
        parametros.abrirMenu.style.display = 'block';
    }
};

function criacaoMenu(){
    let menu = document.querySelector('#menu-sistema');
    let listaMenu = document.createElement('ul');
    listaMenu.className = ('flex flex-col gap-3');
    menu.appendChild(listaMenu);
    parametros.conteudoMenu.forEach((item)=> {
        let itemLista = document.createElement('li');
        let botaoLista = document.createElement('a');
        botaoLista.href = '#';
        botaoLista.id = item.toLowerCase().replaceAll(" ", "-");
        listaMenu.appendChild(itemLista);
        itemLista.appendChild(botaoLista);

        botaoLista.textContent = item;
    })
}





function iniciar(){
    criacaoMenu();
    criaEventos();
    gastosFixos()
};

iniciar();
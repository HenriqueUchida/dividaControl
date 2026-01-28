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
    cardSaldo.className ='flex flex-col items-center bg-white w-80 h-40 p-6 gap-2 rounded-xl shadow-lg cursor-pointer hover:scale-105 transition-transform animate-pulse';
    containerSaldo.className = 'flex flex-row-reverse items-center gap-2';
    tituloSaldo.className = 'text-gray-500 font-medium uppercase text-sm tracking-wider';
    txtSaldo.className = 'text-4xl font-bold text-slate-800';
    cifrao.className = 'text-xl font-semibold text-slate-400';
                            


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
    tituloTela.textContent = 'GASTOS FIXOS';
    parametros.conteudoPrincipal.appendChild(tituloTela);
    parametros.conteudoPrincipal.appendChild(cardGastoFixo);

    cardGastoFixo.className = 'grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-7xl mx-auto mt-8'
    tituloTela.className = 'text-3xl font-black text-slate-800 tracking-tight mb-2'
    
    
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
        containerNatureza.className = 'w-100'

        tituloNatureza.className = 'text-2xl'
    });

    

    getGastosFixos();


}

async function getGastosFixos(){
    const {data: lctos_fixos, error} = await supabaseClient
    .from('lancamento_fixo')
    .select('*')

    if(error) throw error;

    console.log(lctos_fixos);

    lctos_fixos.forEach((lancamento, index)=>{
        if(lancamento.natureza === 'R'){
            const descricaoReceita = lancamento.descricao;
            const valorReceita = lancamento.valor_fixo;
            const diaRecebimento = lancamento.dia_vencimento;

            const listaReceita = document.querySelector('#lista-receitas');
            const elementoReceita = document.createElement('li');
            const conteudoReceita = document.createElement('div');
            conteudoReceita.id = `conteudo-card-${index+1}`
            elementoReceita.appendChild(conteudoReceita);

            const tituloReceita = document.createElement('h3');
            tituloReceita.id = `titulo-card-${index+1}`
            tituloReceita.textContent = `${descricaoReceita}`;
            conteudoReceita.appendChild(tituloReceita);

            const containerDiaRec = document.createElement('div');
            containerDiaRec.id = `container-dia-rec-${index+1}`;
            const txtDiaRecebim = document.createElement('p');
            txtDiaRecebim.textContent = "Recebo dia"; 
            containerDiaRec.appendChild(txtDiaRecebim);
            containerDiaRec.innerHTML +=`<p id="dia-receb-card-${index+1}" class="w-fit">${diaRecebimento}</p>`;
            conteudoReceita.appendChild(containerDiaRec);
            containerDiaRec.className = 'flex flex-col items-center'


            const containerValRec = document.createElement('div');
            containerValRec.id = `container-val-rec-card-${index+1}`;
            containerValRec.className = 'flex flex-col items-center';
            const txtValReceita = document.createElement('p');
            txtValReceita.textContent = "Valor"; 
            containerValRec.appendChild(txtValReceita);
            containerValRec.innerHTML += `<p id="dia-receb-card-${index+1}" class="w-fit">${valorReceita}</p>`;
            conteudoReceita.appendChild(containerValRec);

            listaReceita.appendChild(elementoReceita);

            elementoReceita.className = `flex flex-col bg-white rounded-lg`

            conteudoReceita.className = 'grid grid-cols-2 gap-1';
            tituloReceita.className = 'col-span-2 text-center';
            

        }
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
        if(e.target.matches('#btn-abrir')) {
            parametros.menuLateral.classList.remove('-translate-x-full');
            parametros.abrirMenu.style.display = 'none';
        }
        if(e.target.matches('#btn-fechar') || (e.target.matches('main'))){
            escondeMenu()
        }
        if (parametros.opcoesMenu[idClicado]) {
            parametros.opcoesMenu[idClicado]();
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
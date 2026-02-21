import { supabaseClient } from "../api/client.js"

export function gastosFixos(parametros){
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
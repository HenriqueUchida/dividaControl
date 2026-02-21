import { getSaldo } from "../utilidades/buscaSaldo.js";

export function inicioApp(parametros) {
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
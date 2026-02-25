import { supabaseClient } from "./api/client.js"
import {criacaoMenu, escondeMenu} from "./utilidades/menu.js"
import {inicioApp} from "./modulos/inicio.js"
import {gastosFixos} from "./modulos/fixos.js"
import {renderizaLancamentos} from "./modulos/lancamentos.js"
import {cadastros} from "./modulos/cadastros.js"
import {relatorios} from "./modulos/relatorios.js"
import {logout} from "./modulos/logout.js"

var parametros = {
    opcoesMenu: {
        'inicio': {
            texto: 'Início',
            acao: () => inicioApp(parametros)
        },
        'fixos': {
            texto: 'Gastos Fixos',
            acao: () => gastosFixos(parametros)
        },
        'lancamentos': {
            texto: 'Lançamentos',
            acao: () => renderizaLancamentos(parametros)
        },
        'cadastros': {
            texto: 'Cadastros',
            acao: () => cadastros(parametros)
        },
        'relatorios': {
            texto: 'Relatórios',
            acao: () => relatorios(parametros)
        },
        'sair': {
            texto: 'Sair',
            acao: () => logout(parametros)
        }
    },
    tipoPagto: ['DÉBITO', 'CRÉDITO', 'PIX'],
    natureza: ['Receitas', 'Despesas'],
    conteudoPrincipal: document.querySelector('main'),
    menuLateral: document.querySelector('#menu-lateral'),
    abrirMenu: document.querySelector('#btn-abrir'),
    fecharMenu: document.querySelector('#btn-fechar')
}



function criaEventos(){
    document.querySelector('body').addEventListener('click', (e) => {
        if(e.target.closest('#btn-abrir')) {
            parametros.menuLateral.classList.remove('-translate-x-full');
            parametros.abrirMenu.classList.add('hidden');
        }
        if(e.target.closest('#btn-fechar') || (e.target.matches('main')) || (e.target.matches('main *'))){
            escondeMenu(parametros)
        }
        const link = e.target.closest('a');

        if (link && parametros.opcoesMenu[link.id]) {
            parametros.opcoesMenu[link.id].acao();
            escondeMenu(parametros);
        }
    })
}



function iniciar(){
    criacaoMenu(parametros);
    criaEventos();
    // inicioApp(parametros);
    // gastosFixos()
    renderizaLancamentos(parametros);
};

iniciar();
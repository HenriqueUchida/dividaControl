import {renderizaResumos} from './modulos/resumos.js'
import {renderizaLanc} from './modulos/lancamentos.js'
import {renderizaCadstros} from './modulos/cadastros.js'

function criaEventos() {
    document.querySelector('main').addEventListener('click', (e)=> {
        if(e.target.closest('#balanco')){
            renderizaResumos()
        } else if (e.target.closest('#lancamentos')){
            renderizaLanc()
        } else if (e.target.closest('#cadastros')){
            renderizaCadstros()
        }
    })
}


function inicio() {
    criaEventos()
    renderizaResumos()
}

inicio()
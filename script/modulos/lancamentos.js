import {getCartao} from "../utilidades/buscaCartao.js"
import {getConta} from "../utilidades/buscaConta.js"

var elementosForm = {
    tipoMovimento: {
        id: 'tipo-movimento',
        tipo: 'select',
        label: 'Tipo de Movimentação',
        // conteudo: ['Despesa', 'Receita']
        conteudo:{    
            despesa: {
                texto: 'Despesa',
                dataset: 'D'
            },
            receita: {
                texto: 'Receita',
                dataset: 'R'
            }}
    },
    formaPagto: {
        id: 'forma-pagamento',
        tipo: 'select',
        label: 'Tipo de Pagamento',
        conteudo: {
            debito: {
                texto: 'Débito',
                dataset: 'DEBITO'
            }, 
            credito: {
                texto: 'Crédito',
                dataset: 'CREDITO'
            }, 
            pix: {
                texto: 'Pix',
                dataset: 'PIX'
            }
        }
    }
}

const cartoes = await getCartao();
const contas = await getConta();

console.log(Object.entries(elementosForm.tipoMovimento.conteudo))
Object.entries(elementosForm.tipoMovimento.conteudo).forEach(([batatinha, item]) =>{
    console.log(batatinha)
})

export function renderizaLancamentos(parametros){
    parametros.conteudoPrincipal.textContent = '';
    const containerLancamento = document.createElement('section');
    containerLancamento.id = 'container-lancamento';
    parametros.conteudoPrincipal.appendChild(containerLancamento);
    const formLancamento = document.createElement('form');
    containerLancamento.appendChild(formLancamento);
    const containerMovimento = document.createElement('div');
    formLancamento.appendChild(containerMovimento);
    const txtTipoMovimento = document.createElement('label');
    txtTipoMovimento.textContent = 'Tipo de Movimentação:'
    containerMovimento.appendChild(txtTipoMovimento);
    const boxTipoMovimento = document.createElement('select');
    boxTipoMovimento.id = elementosForm.tipoMovimento.id
    containerMovimento.appendChild(boxTipoMovimento);
    // elementosForm.tipoMovimento.conteudo.forEach((opcao) =>{
    //     console.log(opcao);

    //     // const opcaoTipoMov = document.createElement('option');
    //     // opcaoTipoMov.textContent = opcao;
    //     // boxTipoMovimento.appendChild(opcaoTipoMov);
    // })
    
}

function constroiSelect(campo){
    return
}   
import {getCartao} from "../utilidades/buscaCartao.js"
import {getConta} from "../utilidades/buscaConta.js"

const cartoes = await getCartao();
const contas = await getConta();

var elementosForm = {
    tipoMovimento: {
        id: 'tipo-movimento',
        tipo: 'select',
        label: 'Tipo de Movimentação: ',
        // conteudo: ['Despesa', 'Receita']
        conteudo:{    
            despesa: {
                texto: 'Despesa',
                dataset: 'D',
                value: 'despesa'
            },
            receita: {
                texto: 'Receita',
                dataset: 'R',
                value: 'receita'
            }}
    },
    formaPagto: {
        id: 'forma-pagamento',
        tipo: 'select',
        label: 'Tipo de Pagamento: ',
        conteudo: {
            credito: {
                texto: 'Crédito',
                dataset: 'CREDITO',
                value: 'credito'
            }, 
            debito: {
                texto: 'Débito',
                dataset: 'DEBITO',
                value: 'debito'
            }, 
            pix: {
                texto: 'Pix',
                dataset: 'PIX',
                value: 'pix'
            }
        }
    },
    meioPagto: {
        id: 'meio-pagamento',
        tipo: 'select',
        label: 'Cartão: ',
        conteudo: {
            debito: {
                fonte: contas,
                value: contas
            }, 
            pix: {
                fonte: contas,
                value: contas
            }, 
            credito: {
                fonte: cartoes,
                value: cartoes
            }, 
        }
    }

}



export function renderizaLancamentos(parametros){
    parametros.conteudoPrincipal.textContent = '';
    const containerLancamento = document.createElement('section');
    containerLancamento.id = 'container-lancamento';
    parametros.conteudoPrincipal.appendChild(containerLancamento);
    const formLancamento = document.createElement('form');
    formLancamento.id = 'form-lancamento';
    containerLancamento.appendChild(formLancamento);

    

    const containerMovimento = document.createElement('div');
    formLancamento.appendChild(containerMovimento);
    containerMovimento.id = 'container-tipo-movimento';
    constroiSelect(containerMovimento, Object.entries(elementosForm.tipoMovimento.conteudo), elementosForm.tipoMovimento.id, elementosForm.tipoMovimento.label);
    const containerFormaPagto = document.createElement('div');
    formLancamento.appendChild(containerFormaPagto);
    containerFormaPagto.id = 'container-forma-pagamento';
    constroiSelect(containerFormaPagto, Object.entries(elementosForm.formaPagto.conteudo), elementosForm.formaPagto.id, elementosForm.formaPagto.label);

    const containerMeiosPagto = document.createElement('div');
    formLancamento.appendChild(containerMeiosPagto);
    containerMeiosPagto.id = 'container-meio-pagamento';
    constroiSelect(containerMeiosPagto, Object.entries(elementosForm.meioPagto.conteudo), elementosForm.meioPagto.id, elementosForm.meioPagto.label);
    const idFormaPagto = document.getElementById('forma-pagamento');
    
    
    eventoForm(formLancamento);
    idFormaPagto.addEventListener('change', (e) => {
        // console.log(e.target.value);
        opcoesMeiosPagto(e.target.value);
    });
    opcoesMeiosPagto(idFormaPagto.value);


    const containerValor = document.createElement('div');
    formLancamento.appendChild(containerValor);
    const labelValor = document.createElement('label');
    containerValor.appendChild(labelValor);
    labelValor.textContent = 'Valor (R$): ';
    const inputValor = document.createElement('input');
    containerValor.appendChild(inputValor);
    inputValor.id = 'entrada-valor';
    inputValor.setAttribute('type', 'number');
    inputValor.setAttribute('min', 0.01);
    inputValor.setAttribute('step', 0.01);
    labelValor.setAttribute('for', 'entrada-valor');

    const containerObs = document.createElement('div');
    formLancamento.appendChild(containerObs);
    const labelObs = document.createElement('label');
    containerObs.appendChild(labelObs);
    labelObs.textContent = 'Observações: ';
    const inputObs = document.createElement('input');
    containerObs.appendChild(inputObs);
    inputObs.id = 'entrada-observacao'
    inputObs.setAttribute('type', 'text');
    labelObs.setAttribute('for', 'entrada-observacao');

    const btnLancar = document.createElement('button');
    btnLancar.id = 'enviar-form';
    btnLancar.textContent = 'Lançar';
    containerLancamento.appendChild(btnLancar);
    
}

function constroiSelect(container, objeto, id, label){
    const criaSelect = document.createElement('select');
    const criaLabel = document.createElement('label');
    criaLabel.textContent = label;
    criaLabel.setAttribute('for', id)
    criaSelect.id = id;
    criaLabel.id = `label-${id}`;
    container.appendChild(criaLabel);
    container.appendChild(criaSelect);
    if(id != elementosForm.meioPagto.id)    
        objeto.forEach(([chave, valores]) => {
            const criaOption = document.createElement('option');
            criaSelect.appendChild(criaOption);
            criaOption.value = valores.value;
            criaOption.dataset.tipo = valores.dataset;
            criaOption.textContent = valores.texto;
        })
}   

function opcoesMeiosPagto(formaSelecionada) {
    const selectMeioPagto = document.getElementById('meio-pagamento');
    const labelMeioPagto = document.getElementById('label-meio-pagamento');
    selectMeioPagto.innerHTML = '';

    let dados = [];

    if (formaSelecionada === 'credito'){
        dados = cartoes;
        labelMeioPagto.textContent = 'Cartão: '
    } else {
        dados = contas;
        labelMeioPagto.textContent = 'Conta: '
    }

    dados.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id_cartao || item.id_conta; 
        option.textContent = item.descr_cartao || item.descr_conta
        selectMeioPagto.appendChild(option);
    })
}

function eventoForm(containerForm) {
    const tipoMov = containerForm.children[0];
    const tipoPagto = containerForm.children[1];
    const meioPagto = containerForm.children[2];
    
    containerForm.addEventListener('change', (e)=>{
        
        if(e.target.id == 'tipo-movimento' && e.target.value == 'receita'){
            tipoPagto.style.display = 'none';
            console.log(tipoPagto);
        } else if (e.target.id == 'tipo-movimento' && e.target.value == 'despesa'){
            tipoPagto.style.display = 'block'
        }
        // console.log(e.target.id, e.target.value)
    })
}
export function renderizaLancamentos(parametros){
    parametros.conteudoPrincipal.textContent = '';
    const containerLancamento = document.createElement('section');
    containerLancamento.id = 'container-lancamento';
    parametros.conteudoPrincipal.appendChild(containerLancamento);
    // const cabcecalhoSessao = document.createElement('header');
    // containerLancamento.appendChild(cabcecalhoSessao);
    // const menuLancamento = document.createElement('nav');
    // cabcecalhoSessao.appendChild(menuLancamento);
    // const listaMenu = document.createElement('ul');
    // menuLancamento.appendChild(listaMenu);
    // parametros.natureza.forEach((opcao) => {
    //     const opcaoMenu = document.createElement('li');
    //     opcaoMenu.textContent = opcao;
    //     opcaoMenu.id = opcao;
    //     listaMenu.append(opcaoMenu);
    // });
    const formLancamento = document.createElement('form');
    containerLancamento.appendChild(formLancamento);
    
}

function constroiForm(){
    return
}   
function inicioApp(){
    console.log('Visualização inicial');
}

function gastosFixos(){
    console.log('Tela de manutenção dos gastos fixos');
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
        if(e.target.matches('#btn-fechar') || e.target.matches('main')){
            escondeMenu()
        }
        if (parametros.opcoesMenu[idClicado]) {
            parametros.opcoesMenu[idClicado]();
            escondeMenu();
        }
    })
}

function escondeMenu(){
    parametros.menuLateral.classList.add('-translate-x-full');
    parametros.abrirMenu.style.display = 'block';
};

function criacaoMenu(){
    let menu = document.querySelector('#menu-sistema');
    let listaMenu = document.createElement('ul');
    listaMenu.className = ('flex flex-col gap-3')
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
};

iniciar();
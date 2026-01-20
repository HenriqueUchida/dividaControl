var parametros = {
    conteudoMenu: ['Inicio', 'Gastos Fixos', 'Lancamentos', 'Relatorios', 'Cadastros', 'Sair']
};

function criaEventos(e){
    const menuLateral = document.querySelector('#menu-lateral');
    const btnAbrir = document.querySelector('#btn-abrir');
    const btnFechar = document.querySelector('#btn-fechar');
    let containerBody = document.querySelector('body');
    containerBody.addEventListener('click', (e) => {
        if(e.target.matches('#btn-abrir')) {
            menuLateral.classList.remove('-translate-x-full');
            btnAbrir.style.display = 'none';
        }
        if(e.target.matches('#btn-fechar')){
            menuLateral.classList.add('-translate-x-full');
            btnAbrir.style.display = 'block';
        }
        if(e.target.matches('#inicio')){
            inicioApp();
        }
        if(e.target.matches('#gastos-fixos')){
            gastosFixos();
        }
        if(e.target.matches('#lancamentos')){
            lancamentos();
        }
        if(e.target.matches('#cadastros')){
            cadastros();
        }
        if(e.target.matches('#relatorios')){
            relatorios();
        }
        if(e.target.matches('#sair')){
            logout();
        }
    })
}

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

function iniciar(){
    criacaoMenu();
    criaEventos();
};

iniciar();
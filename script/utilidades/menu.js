export function criacaoMenu(parametros){
    let menu = document.querySelector('#menu-sistema');
    let listaMenu = document.createElement('ul');
    listaMenu.className = ('flex flex-col gap-3');
    menu.appendChild(listaMenu);
    // console.log(Object.entries(parametros.opcoesMenu))
    Object.entries(parametros.opcoesMenu).forEach(([id, opcao])=>{
        // console.log(id, opcao)
        let itemLista = document.createElement('li');
        let botaoLista = document.createElement('a');
        botaoLista.href = '#';
        botaoLista.id = id
        listaMenu.appendChild(itemLista);
        itemLista.appendChild(botaoLista);
        botaoLista.textContent = opcao.texto;
        
    })

}

export function escondeMenu(parametros){
    const mobile = window.innerWidth < 1024;
   if (mobile) {
        parametros.menuLateral.classList.add('-translate-x-full');
        parametros.abrirMenu.classList.remove('hidden'); // Volta a mostrar o botão no mobile
    } else {
        parametros.menuLateral.classList.remove('-translate-x-full');
        parametros.abrirMenu.classList.add('hidden');
    }
}

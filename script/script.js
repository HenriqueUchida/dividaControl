class MobileNavbar {
    constructor(mobileMenu, navList, navLinks) {
        this.mobileMenu = document.querySelector(mobileMenu);
        this.navList = document.querySelector(navList);
        this.navLinks = document.querySelectorAll(navLinks);
        this.activeClass = "active"

        this.handleClick = this.handleClick.bind(this);
    }


    animateLinks() {
        this.navLinks.forEach((link, index) => {
            link.style.animation
            ? (link.style.animation = "")
            : (link.style.animation = `navLinkFade 0.5s ease forwards ${index/7 + 0.3}s`);
        });
    }

    handleClick() {
        this.navList.classList.toggle(this.activeClass);
        this.mobileMenu.classList.toggle(this.activeClass);
        this.animateLinks();
    }

    addClickEvent() {
        this.mobileMenu.addEventListener("click", this.handleClick); 
    }

    init() {
        if (this.mobileMenu) {
            this.addClickEvent();
        }
        return this;
    }
}

const mobileNavbar = new MobileNavbar(
    ".mobile-menu",
    ".nav-list",
    ".nav-list li",
);
mobileNavbar.init();

let enviar = document.querySelector('input#enviar').addEventListener('click', envia)
let val = document.getElementById('campo-valor')
let motivo = document.getElementById('campo-motivo')

val.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        motivo.focus()
    }
})

motivo.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        envia(event)
    }    
})

let pagto = document.getElementById('tipo-pagamento')
let txt = document.getElementById('teste')
let dataInicio = new Date()
let dia = String(dataInicio.getDate()).padStart(2, '0')
let mes = String(dataInicio.getMonth() + 1).padStart(2, '0') //Em js os meses são de 0 a 11, por isso soma-se 1
let ano = String(dataInicio.getFullYear())
let dataFormatada = `${dia}/${mes}/${ano}`
let dados = {}

function envia(event) {
    if (val.value == '' || motivo.value == '') {
        event.preventDefault()
        alert('Preencha todos os campos antes de enviar')
        txt.innerHTML = ''
        if (val.value == '' && motivo.value == ''){
            val.focus()
        } else if(val.value == '' && motivo.value != '') {
            val.focus()
        } else if (val.value != '' && motivo.value == '') {
            motivo.focus()
        }
        return
    } else {
        dados.data = dataFormatada
        dados.pagamento = pagto.value.toUpperCase()
        dados.valor = val.value
        dados.motivo = motivo.value.toUpperCase()
        txt.innerHTML = `
            <h3>Dados Enviados:</h3>
            <p><strong>Data:</strong> ${dados.data}</p>
            <p><strong>Pagamento:</strong> ${dados.pagamento}</p>
            <p><strong>Valor:</strong> ${dados.valor}</p>
            <p><strong>Motivo:</strong> ${dados.motivo}</p>
        `
        alert(`até aqui deu certo - ${dataFormatada}`)
    } 
    val.value = ''
    motivo.value = ''
    val.focus()
}
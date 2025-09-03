let enviar = document.querySelector('input#enviar').addEventListener('click', envia)
let val = document.getElementById('campo-valor')
let motivo = document.getElementById('campo-motivo')
let btnDespesa = document.querySelector('a#despesa')
let btnReceita = document.querySelector('a#receita')
let formaPagto = document.getElementById('combo-box')
let tituloMain = document.querySelector('h2#titulo-main')
let controlPage = 'despesa'

btnDespesa.addEventListener('click', (event) => {
    event.preventDefault()
    controlPage = 'despesa'
    trocaPagina()
})

btnReceita.addEventListener('click', (event) => {
    event.preventDefault()
    controlPage = 'receita'
    trocaPagina()
})

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

function trocaPagina() {
    console.log(controlPage)
    console.log(pagto.value)
    if (controlPage === 'despesa') {
        pagto.value = 'debito'
        formaPagto.style.display = 'flex'
        tituloMain.textContent = 'Insira sua dívida'
        val.placeholder = 'Ex: 50.75'
        motivo.placeholder = 'Ex: Gasolina para moto'
        btnReceita.style.fontSize = '1em'
        btnDespesa.style.fontSize = '1.2em'
        btnReceita.style.fontWeight = 'normal'
        btnDespesa.style.fontWeight = 'bolder'
        btnDespesa.style.color = '#8DE4F2'
        btnReceita.style.color = '#ffffff'
        btnDespesa.style.textDecoration = 'underline'
        btnReceita.style.textDecoration = 'none'
    } else if (controlPage === 'receita') {
        pagto.value = 'pix'
        formaPagto.style.display = 'none'
        tituloMain.textContent = 'Insira sua receita'
        val.placeholder = 'Ex: 1000,67'
        motivo.placeholder = 'Ex: Salário quinto dia útil'
        btnReceita.style.fontSize = '1.2em'
        btnDespesa.style.fontSize = '1em'
        btnReceita.style.fontWeight = 'bolder'
        btnDespesa.style.fontWeight = 'normal'
        btnReceita.style.color = '#8DE4F2'
        btnDespesa.style.color = '#ffffff'
        btnReceita.style.textDecoration = 'underline'
        btnDespesa.style.textDecoration = 'none'
    }
}

let enviar = document.querySelector('input#enviar').addEventListener('click', envia)
let val = document.getElementById('campo-valor')
let motivo = document.getElementById('campo-motivo')
let btnDespesa = document.querySelector('a#despesa')
let btnReceita = document.querySelector('a#receita')
let formaPagto = document.getElementById('combo-box')
let tituloMain = document.querySelector('h2#titulo-main')
let pagto = document.getElementById('tipo-pagamento')
let txt = document.getElementById('teste')
let containerParcela = document.getElementById('container-parcela')
let qtdeParcelas = document.getElementById('qtde-parcelas')
let radioAvista = document.getElementById('a-vista')
let radioParcelado = document.querySelector('#parcelado')
let dataInicio = new Date()
let dia = String(dataInicio.getDate()).padStart(2, '0')
let mes = String(dataInicio.getMonth() + 1).padStart(2, '0') //Em js os meses são de 0 a 11, por isso soma-se 1
let ano = String(dataInicio.getFullYear())
let dataFormatada = `${dia}/${mes}/${ano}`
let dados = {}
let controlPage = 'despesa'
window.addEventListener('load', inicoPadrao())

function inicoPadrao() {
    containerParcela.style.display = 'none'
    qtdeParcelas.value = 1
    qtdeParcelas.style.display = 'none'
    radioAvista.checked = true
}

radioAvista.addEventListener('change', verificaRadio)
radioParcelado.addEventListener('change', verificaRadio)

function verificaRadio() {
    if(pagto.value == 'credito' && radioAvista.checked) {
        qtdeParcelas.value = 1
        qtdeParcelas.readOnly = true
        qtdeParcelas.style.cursor = 'not-allowed'
        qtdeParcelas.style.backgroundColor = 'lightgrey'
        qtdeParcelas.addEventListener('click', alert('Impossível alterar parcela para pagamentos a vista!'))
    } else if (pagto.value == 'credito' && radioAvista.checked != true) {
        qtdeParcelas.value = 2
        qtdeParcelas.readOnly = false
        qtdeParcelas.style.cursor = 'default'
        qtdeParcelas.style.backgroundColor = 'white'
    }
}



pagto.addEventListener('change', function() {
    console.log(pagto.value)
    if (pagto.value === 'debito' || pagto.value === 'pix') {
        containerParcela.style.display = 'none'
        qtdeParcelas.value = 1
        qtdeParcelas.style.display = 'none'
        radioAvista.checked = true
    } else {
        verificaRadio()
        containerParcela.style.display = 'flex'
        containerParcela.style.gap = '1rem'
        qtdeParcelas.style.display = 'block'
    }


})

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
        txt.style.display = 'block'
        dados.data = dataFormatada
        dados.tipo = controlPage.toUpperCase()
        dados.pagamento = pagto.value.toUpperCase()
        dados.parcelas = qtdeParcelas.value
        dados.valor = val.value
        dados.motivo = motivo.value.toUpperCase()
        txt.innerHTML = `
            <h3>Último Envio:</h3>
            <p><strong>Data:</strong> ${dados.data}</p>
            <p><strong>Tipo:</strong> ${dados.tipo}</p>
            <p><strong>Pagamento:</strong> ${dados.pagamento}</p>
            <p><strong>Parcelas:</strong> ${dados.parcelas}</p>
            <p><strong>Valor:</strong> ${dados.valor}</p>
            <p><strong>Motivo:</strong> ${dados.motivo}</p>
        `
        alert(`até aqui deu certo - ${dataFormatada}`)
        console.log(dados)
    } 
    val.value = ''
    motivo.value = ''
    val.focus()
}

function trocaPagina() {
    // console.log(controlPage)
    // console.log(pagto.value)
    if (controlPage === 'despesa') {
        pagto.value = 'debito'
        formaPagto.style.display = 'flex'
        containerParcela.style.display = 'block'
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
        inicoPadrao()
    } else if (controlPage === 'receita') {
        pagto.value = 'pix'
        formaPagto.style.display = 'none'
        containerParcela.style.display = 'none'
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
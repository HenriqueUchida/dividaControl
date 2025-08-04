let enviar = document.querySelector('input#enviar').addEventListener('click', envia)
let val = document.getElementById('campo-valor')
let motivo = document.getElementById('campo-motivo')
motivo.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        envia(event)
    }    
})
val.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        motivo.focus()
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
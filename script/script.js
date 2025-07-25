let enviar = document.querySelector('input#enviar')
enviar.addEventListener('click', envia)
let val = document.getElementById('campo-valor')
let motivo = document.getElementById('campo-motivo')
let pagto = document.getElementById('tipo-pagamento')
let txt = document.getElementById('teste')
let dataInicio = new Date()
let dia = String(dataInicio.getDate()).padStart(2, '0')
let mes = String(dataInicio.getMonth() + 1).padStart(2, '0') //Em js os meses são de 0 a 11, por isso soma-se 1
let ano = String(dataInicio.getFullYear())
let dataFormatada = `${dia}/${mes}/${ano}`
let dados = {}

function envia() {
    if (val.value == '' || motivo.value == '') {
        alert('Preencha todos os campos antes de enviar')
        txt.innerHTML = ''
    } else {
        dados.data = dataFormatada
        dados.pagamento = pagto.value
        dados.valor = val.value
        dados.motivo = motivo.value
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
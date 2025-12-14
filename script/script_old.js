const enviar = document.querySelector('#meu-formulario')
enviar.addEventListener('submit', envia)
let val = document.getElementById('campo-valor')
let valAPagar = val
let motivo = document.getElementById('campo-motivo')
let btnDespesa = document.querySelector('a#despesa')
let btnReceita = document.querySelector('a#receita')
let containerPagto = document.getElementById('combo-box')
let tituloMain = document.querySelector('h2#titulo-main')
let pagto = document.getElementById('tipo-pagamento')
let txt = document.getElementById('teste')
let modalidade = 'A vista'
let cartao = document.getElementById('cartoes')
let containerParcela = document.getElementById('container-parcela')
let qtdeParcelas = document.getElementById('qtde-parcelas')
let parcelaAtual = 1
let radioAvista = document.getElementById('a-vista')
let radioParcelado = document.querySelector('#parcelado')
let containerCategoria = document.querySelector('#container-categoria')
let categoria = document.querySelector('#categoria')
let dataInicio = new Date()
let dia = String(dataInicio.getDate()).padStart(2, '0')//padStart é tipo o LPAD do oracle, nesse caso, o comando diz que vai ter dois caracteres e completar com 0.
let mes = String(dataInicio.getMonth() + 1).padStart(2, '0') //Em js os meses são de 0 a 11, por isso soma-se 1
let ano = String(dataInicio.getFullYear())
let dataFormatada = `${dia}/${mes}/${ano}`
let dados = {}
let values = []  

let controlPage = 'despesa'
window.addEventListener('load', inicoPadrao)

function inicoPadrao() {
    pagto.value = 'debito'
    containerParcela.style.display = 'none'
    qtdeParcelas.value = 1
    qtdeParcelas.style.display = 'none'
    radioAvista.checked = true
    val.value = ''
    motivo.value = ''
    val.focus()
}

radioAvista.addEventListener('change', verificaRadio)
radioParcelado.addEventListener('change', verificaRadio)
qtdeParcelas.addEventListener('click', aviso)

function verificaRadio() {
    if(pagto.value == 'credito' && radioAvista.checked) {
        modalidade = 'A vista'
        qtdeParcelas.value = 1
        qtdeParcelas.readOnly = true
        qtdeParcelas.style.cursor = 'not-allowed'
        qtdeParcelas.style.backgroundColor = 'lightgrey'
        val.focus()
    } else if (pagto.value == 'credito' && radioAvista.checked != true) {
        modalidade = 'Parcelado'
        qtdeParcelas.value = 2
        qtdeParcelas.readOnly = false
        qtdeParcelas.style.cursor = 'default'
        qtdeParcelas.style.backgroundColor = 'white'
        qtdeParcelas.focus()
    }
}



pagto.addEventListener('change', function() {
    console.log(pagto.value)
    if (pagto.value === 'debito' || pagto.value === 'pix') {
        modalidade = 'A vista'
        cartao.value = ''
        containerParcela.style.display = 'none'
        qtdeParcelas.value = 1
        qtdeParcelas.style.display = 'none'
        radioAvista.checked = true
        val.focus()
    } else {
        verificaRadio()
        cartao.value = 'nubank'
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
        event.preventDefault()
        motivo.focus()
    }
})

qtdeParcelas.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault()
        val.focus()
    }
})

motivo.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault()
        envia(event)
    }    
})


function envia(event) {
    event.preventDefault()
    if (controlPage === 'despesa') {
        if (val.value == '' || motivo.value == '' || qtdeParcelas.value == '') {
            event.preventDefault()
            alert('Preencha todos os campos antes de enviar')
            txt.innerHTML = ''
            if (val.value == ''){
                val.focus()
            } else if (motivo.value == '') {
                motivo.focus()
            } else if (qtdeParcelas.value == '') {
                qtdeParcelas.focus()
            }
            return
        } else if (radioAvista.checked != true && qtdeParcelas.value == 1) {
            alert('[ERRO]Numero de parcela inválido!')
            qtdeParcelas.value = 2
            qtdeParcelas.focus()
            return
        } if (radioAvista.checked != true && qtdeParcelas.value > 1){
                txt.style.display = 'block'
                valAPagar = (Number(val.value)/Number(qtdeParcelas.value)).toFixed(2)
                let values = []
                let dados = {}
                for(let i = 1; i<=qtdeParcelas.value; i++){
                    let motivoArr = ''
                    let dataVencimento = new Date(dataInicio.getFullYear(), dataInicio.getMonth(), dataInicio.getDate())
                    dataVencimento.setMonth(dataVencimento.getMonth() + (i))
                    const dia = String(dataVencimento.getDate()).padStart(2, '0')
                    const mes = String(dataVencimento.getMonth() + 1).padStart(2, '0')
                    const ano = dataVencimento.getFullYear()
                    dataFormatada = `${dia}/${mes}/${ano}`
                    // console.log(motivoArr, 'antes de incluir')
                    motivoArr = `${motivo.value} ${i}/${qtdeParcelas.value}`
                    let linhasArr = []
                    linhasArr.push(dataFormatada)
                    linhasArr.push(controlPage.toUpperCase())
                    linhasArr.push(cartoes.value.toUpperCase())
                    linhasArr.push(pagto.value.toUpperCase())
                    linhasArr.push(modalidade.toUpperCase())
                    linhasArr.push(qtdeParcelas.value)
                    linhasArr.push(valAPagar) // não precisa do .value porque não veio do HTML
                    linhasArr.push(val.value)
                    linhasArr.push(motivoArr.toUpperCase())
                    linhasArr.push(categoria.value.toUpperCase())
                    console.log(mes)
                    values.push(linhasArr)
                    
                }
                dados.data = dataFormatada
                dados.tipo = controlPage.toUpperCase()
                dados.pagamento = pagto.value.toUpperCase()
                dados.cartao = cartao.value.toUpperCase()
                dados.modalidade = modalidade.toUpperCase()
                dados.parcelas = qtdeParcelas.value
                dados.valor = val.value
                dados.motivo = motivo.value.toUpperCase()
                dados.categoria = categoria.value.toUpperCase()
                txt.innerHTML = `
                    <h3>Último Envio:</h3>
                    <p><strong>Data:</strong> ${dados.data}</p>
                    <p><strong>Tipo:</strong> ${dados.tipo}</p>
                    <p><strong>Pagamento:</strong> ${dados.pagamento}</p>
                    <p><strong>Cartao:</strong> ${dados.cartao}</p>
                    <p><strong>Modalidade:</strong> ${dados.modalidade}</p>
                    <p><strong>Parcelas:</strong> ${dados.parcelas}</p>
                    <p><strong>Valor:</strong> ${dados.valor}</p>
                    <p><strong>Motivo:</strong> ${dados.motivo}</p>
                    <p><strong>Categoria:</strong> ${dados.categoria}</p>
                `
                alert(`até aqui deu certo - ${dataFormatada}`)
                
                // enviar.submit()

            } else {
                linhasArr = []
                values = []
                txt.style.display = 'block'
                dados.data = dataFormatada
                dados.tipo = controlPage.toUpperCase()
                dados.pagamento = pagto.value.toUpperCase()
                dados.cartao = cartao.value.toUpperCase()
                dados.modalidade = modalidade.toUpperCase()
                dados.parcelas = qtdeParcelas.value
                dados.valor = val.value
                dados.motivo = motivo.value.toUpperCase()
                dados.categoria = categoria.value.toUpperCase()
                linhasArr.push(dataFormatada)
                linhasArr.push(controlPage.toUpperCase()) 
                linhasArr.push(pagto.value.toUpperCase())
                linhasArr.push(cartoes.value.toUpperCase())
                linhasArr.push(modalidade.toUpperCase())
                linhasArr.push(qtdeParcelas.value)
                linhasArr.push(valAPagar.value) 
                linhasArr.push(val.value)
                linhasArr.push(motivo.value.toUpperCase())
                linhasArr.push(categoria.value.toUpperCase())
                values.push(linhasArr)
                txt.innerHTML = `
                    <h3>Último Envio:</h3>
                    <p><strong>Data:</strong> ${dados.data}</p>
                    <p><strong>Tipo:</strong> ${dados.tipo}</p>
                    <p><strong>Pagamento:</strong> ${dados.pagamento}</p>
                    <p><strong>Cartao:</strong> ${dados.cartao}</p>
                    <p><strong>Modalidade:</strong> ${dados.modalidade}</p>
                    <p><strong>Parcelas:</strong> ${dados.parcelas}</p>
                    <p><strong>Valor:</strong> ${dados.valor}</p>
                    <p><strong>Motivo:</strong> ${dados.motivo}</p>
                    <p><strong>Categoria:</strong> ${dados.categoria}</p>
                `
                alert(`até aqui deu certo - ${dataFormatada}`)
                console.log(values)
                debugger
                enviar.submit()
            }
        } else {
            let values = []
            let linhasArr = []
            let categoria = 'salario'
            pagto.value = 'pix'
            qtdeParcelas.value = 1
            cartoes.value = ''
            modalidade = 'A vista'
            if (val.value == '' || motivo.value == '') {
                event.preventDefault()
                alert('Informe todos os valores antes de enviar')
            } else if (val.value == '') {
                event.preventDefault()
                val.focus()
            } else if (motivo.value == '') {
                event.preventDefault()
                motivo.focus()
            return
            } else {
                linhasArr.push(dataFormatada)
                linhasArr.push(controlPage.toUpperCase()) 
                linhasArr.push(pagto.value.toUpperCase())
                linhasArr.push(cartoes.value.toUpperCase())
                linhasArr.push(modalidade.toUpperCase())
                linhasArr.push(qtdeParcelas.value)
                linhasArr.push(valAPagar.value) 
                linhasArr.push(val.value)
                linhasArr.push(motivo.value.toUpperCase())
                linhasArr.push(categoria.toUpperCase())
                values.push(linhasArr)
            }   
        }
    
}

function trocaPagina() {
    if (controlPage === 'despesa') {
        pagto.value = 'debito'
        containerPagto.style.display = 'flex'
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
        containerCategoria.style.display = 'block'
        inicoPadrao()
    } else if (controlPage === 'receita') {
        pagto.value = 'pix'
        containerPagto.style.display = 'none'
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
        containerCategoria.style.display = 'none'
    }
}

function aviso() {
    if(qtdeParcelas.readOnly === true) {
        alert('Impossivel alterar parcela para pagamento em crédito a vista!')
    }
}
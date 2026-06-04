const URL = 'http://localhost:3000';

export async function buscaFaturas(dataIni, dataFim){
    const res = await fetch(`${URL}/resumos/faturas?data_ini=${dataIni}&data_fim=${dataFim}`);
    return res.json();

}

export async function buscaLancamentos(dataIni, dataFim){
    const res = await fetch(`${URL}/resumos/lancamentos?data_ini=${dataIni}&data_fim=${dataFim}`)
    return res.json();
}
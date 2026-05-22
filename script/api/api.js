const URL = 'http://localhost:3000';

export async function buscaFaturas(dataIni, dataFim){
    const res = await fetch(`${URL}/resumos/faturas?data_ini=${dataIni}&data_fim=${dataFim}`);
    return res.json();

}
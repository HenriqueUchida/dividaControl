import {supabaseClient} from "../api/client.js"

export async function getConta() {
    try {
        const {data: contas, error} = await supabaseClient
        .from('conta_bancaria')
        .select('id_conta, descr_conta, saldo')
        return contas
    } catch {
        console.error('Não foi possível buscar as contas bancárias', err);
        return [];
    }
}
import { supabaseClient } from '../api/client.js';


export async function getCartao() {
    try {
        const {data: cartoes, error} = await supabaseClient
        .from('cartao')
        .select('id_cartao, descr_cartao, data_fechamento, data_vencimento, tipo_cartao, limite')
        return cartoes
    } catch(err) {
        console.error('Não foi possível buscar as informações', err);
        return [];
    }
}
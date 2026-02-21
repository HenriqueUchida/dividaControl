import { supabaseClient } from '../api/client.js';

export async function getSaldo() {
    const txtSaldo = document.querySelector('#txt-saldo');
    const cardSaldo = document.querySelector('#card-saldo');

    try {
        const {data: contas, error} = await supabaseClient
        .from('conta_bancaria')
        .select('desc_conta, saldo');

        if (error) throw error;
        // Soma todos os saldos
        const total = contas.reduce((acc, conta) => acc + (conta.saldo || 0), 0);

        // Formata apenas o número para o seu elemento <p>
        txtSaldo.textContent = total.toLocaleString('pt-BR', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        });

        // Remove a animação de carregamento
        cardSaldo.classList.remove('animate-pulse');
        cardSaldo.classList.add('border-t-4', 'border-blue-600');

    } catch (err) {
        console.error('Erro ao popular saldo:', err);
        txtSaldo.textContent = 'Erro';
    }
    
}
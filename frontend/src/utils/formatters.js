const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

/**
 * Converte um valor financeiro estritamente em centavos (inteiro)
 * para exibição formatada na tela em Reais (R$).
 *
 * @param {number} cents Valor inteiro em centavos (ex: 15000)
 * @returns {string} Valor formatado (ex: "R$ 150,00")
 */
export function formatCentsToBRL(cents) {
  if (typeof cents !== 'number' || isNaN(cents)) {
    return brlFormatter.format(0);
  }
  return brlFormatter.format(cents / 100);
}

/**
 * Formata data no formato AAAA-MM-DD para DD/MM/AAAA.
 *
 * @param {string} dateStr 'AAAA-MM-DD'
 * @returns {string} 'DD/MM/AAAA'
 */
export function formatDateBR(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}


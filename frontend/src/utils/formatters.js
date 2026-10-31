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
 * Formata data (string ISO, AAAA-MM-DD ou Date) para DD/MM/AAAA.
 *
 * @param {string|Date} dateVal
 * @returns {string} 'DD/MM/AAAA'
 */
export function formatDateBR(dateVal) {
  if (!dateVal) return '';

  const str = typeof dateVal === 'string' ? dateVal : dateVal.toISOString();
  // Isola apenas o trecho da data antes do indicador de horário 'T'
  const dateOnly = str.split('T')[0];
  const parts = dateOnly.split('-');

  if (parts.length !== 3) return str;

  const [year, month, day] = parts;
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
}

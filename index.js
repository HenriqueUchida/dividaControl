// index.js

const express = require("express");
const { google } = require("googleapis");
const cors = require("cors"); // <-- Importação está correta

const app = express();
app.use(express.json()); // <-- Mantenha isso para ler o corpo JSON

// --- CORREÇÃO 1: CONFIGURAÇÃO ESPECÍFICA DO CORS ---
// Substitua o app.use(cors()) por esta configuração detalhada.
const corsOptions = {
  // MUITO IMPORTANTE: Substitua pela URL real do seu site no Vercel!
  origin: 'https://divida-control-henrique.vercel.app', 
  methods: "GET,POST", // Liste os métodos que sua API utiliza
  allowedHeaders: "Content-Type", // Liste os cabeçalhos que seu front-end envia
  optionsSuccessStatus: 204
};
// Use o middleware do CORS com as opções definidas, ANTES das suas rotas.
app.use(cors(corsOptions));
// --------------------------------------------------

// Variáveis globais
let googleSheetsClient;
let spreadsheetId;

/**
 * Inicializa o cliente do Google Sheets (executada 1 vez no start).
 */
async function initializeGoogleSheets() {
  try {
    // Confere se as variáveis estão disponíveis
    if (!process.env.GOOGLE_CREDENTIALS) {
      throw new Error("A variável GOOGLE_CREDENTIALS não está definida no ambiente!");
    }
    if (!process.env.SPREADSHEET_ID) {
      throw new Error("A variável SPREADSHEET_ID não está definida no ambiente!");
    }

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
      scopes: "https://www.googleapis.com/auth/spreadsheets",
    });

    const authClient = await auth.getClient();

    googleSheetsClient = google.sheets({
      version: "v4",
      auth: authClient,
    });

    spreadsheetId = process.env.SPREADSHEET_ID;

    console.log("✅ Cliente do Google Sheets autenticado e pronto para uso!");
  } catch (error) {
    console.error("❌ Erro durante a autenticação com o Google Sheets:", error.message);
    process.exit(1);
  }
}

// Rotas
app.get("/", (req, res) => {
  res.send("🚀 API do Google Sheets rodando no Render!");
});

// Suas outras rotas (getRows, metadata) estão corretas e podem ser mantidas aqui...

app.post("/addRow", async (req, res) => {
  // --- CORREÇÃO 2: BUSCAR 'sheetData' EM VEZ DE 'values' ---
  const { sheetData } = req.body;

  // Validação ajustada para 'sheetData'
  if (!sheetData || !Array.isArray(sheetData)) {
    return res
      .status(400)
      .send("O corpo da requisição deve conter um array 'sheetData'.");
  }

  try {
    const row = await googleSheetsClient.spreadsheets.values.append({
      spreadsheetId,
      range: "Página1", // Verifique se o nome da sua aba é exatamente "Página1"
      valueInputOption: "USER_ENTERED",
      // O 'resource' espera um objeto com uma propriedade 'values',
      // então criamos um com os dados recebidos de 'sheetData'.
      resource: { values: sheetData },
    });
    res.send(row.data);
  } catch (error) {
    console.error("Erro ao adicionar linha:", error);
    res.status(500).send("Erro no servidor ao adicionar linha na planilha.");
  }
});

// Porta definida pelo Render (ou 3000 localmente)
const PORT = process.env.PORT || 3000;

// Inicializa e sobe o servidor
initializeGoogleSheets().then(() => {
  app.listen(PORT, () =>
    console.log(`🚀 Servidor rodando na porta ${PORT}`)
  );
});
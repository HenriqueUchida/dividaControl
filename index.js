// index.js

const express = require("express");
const { google } = require("googleapis");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

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

app.get("/metadata", async (req, res) => {
  try {
    const metadata = await googleSheetsClient.spreadsheets.get({ spreadsheetId });
    res.send(metadata.data);
  } catch (error) {
    console.error("Erro ao buscar metadados:", error);
    res.status(500).send("Erro no servidor ao buscar metadados da planilha.");
  }
});

app.get("/getRows", async (req, res) => {
  try {
    const getRows = await googleSheetsClient.spreadsheets.values.get({
      spreadsheetId,
      range: "Página1",
    });
    res.send(getRows.data);
  } catch (error) {
    console.error("Erro ao buscar linhas:", error);
    res.status(500).send("Erro no servidor ao buscar linhas da planilha.");
  }
});

app.post("/addRow", async (req, res) => {
  const { values } = req.body;

  if (!values || !Array.isArray(values)) {
    return res
      .status(400)
      .send("O corpo da requisição deve conter um array 'values'.");
  }

  try {
    const row = await googleSheetsClient.spreadsheets.values.append({
      spreadsheetId,
      range: "Página1",
      valueInputOption: "USER_ENTERED",
      resource: { values },
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

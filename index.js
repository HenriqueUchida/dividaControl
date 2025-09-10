// index.js

require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env
const express = require("express");
const { google } = require("googleapis");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Variáveis globais para armazenar o cliente da planilha e o ID
// Isso evita a re-autenticação em cada requisição
let googleSheetsClient;
let spreadsheetId;

/**
 * Função de inicialização que se autentica no Google UMA VEZ e prepara o cliente.
 * É executada assim que o servidor inicia.
 */
async function initializeGoogleSheets() {
    try {
        const auth = new google.auth.GoogleAuth({
            // As credenciais são lidas da variável de ambiente, não de um arquivo
            credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
            scopes: "https://www.googleapis.com/auth/spreadsheets",
        });

        const authClient = await auth.getClient();

        googleSheetsClient = google.sheets({
            version: "v4",
            auth: authClient,
        });

        spreadsheetId = process.env.SPREADSHEET_ID;

        console.log("Cliente do Google Sheets autenticado e pronto para uso! ✅");
    } catch (error) {
        console.error("❌ Erro durante a autenticação com o Google Sheets:", error);
        process.exit(1); // Encerra a aplicação se a autenticação falhar
    }
}

// Rotas da API
app.get("/metadata", async (req, res) => {
    try {
        const metadata = await googleSheetsClient.spreadsheets.get({
            spreadsheetId,
        });
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
            range: "Página1", // Você pode tornar isso dinâmico se quiser
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
        return res.status(400).send("O corpo da requisição deve conter um array 'values'.");
    }

    try {
        const row = await googleSheetsClient.spreadsheets.values.append({
            spreadsheetId,
            range: "Página1",
            valueInputOption: "USER_ENTERED",
            resource: {
                values: values,
            },
        });
        res.send(row.data);
    } catch (error) {
        console.error("Erro ao adicionar linha:", error);
        res.status(500).send("Erro no servidor ao adicionar linha na planilha.");
    }
});

// Define a porta a partir da variável de ambiente ou usa 3001 como padrão
const PORT = process.env.PORT || 3001;

// Inicializa o cliente do Google e SÓ DEPOIS inicia o servidor Express
initializeGoogleSheets().then(() => {
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT} 🚀`));
});
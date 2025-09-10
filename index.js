const express = require("express");
const {google} = require("googleapis");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

async function getAuthSheets() {

    const auth = new google.auth.GoogleAuth({
        keyFile: "./credencial/credentials.json",
        scopes: "https://www.googleapis.com/auth/spreadsheets"
    })

    const client = await auth.getClient();

    const googleSheets = google.sheets({
        version: "v4",
        auth: client
    });

    const spreadsheetId = "1_2hxcvLEMOw76pi5JV02LYsYwikYdSkfzxHyai8OleE";

    return {
        auth,
        client,
        googleSheets,
        spreadsheetId,
    };
}

app.get("/metadata", async (req,res)=>{

    const {googleSheets, auth, spreadsheetId} = await getAuthSheets();

    const metadata = await googleSheets.spreadsheets.get({
        auth,
        spreadsheetId,
    })
    res.send(metadata.data);
});

app.get("/getRows", async(req,res)=> {
    const {googleSheets, auth, spreadsheetId} = await getAuthSheets();

    const getRows = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: "Página1",
        valueRenderOption: "UNFORMATTED_VALUE",
        dateTimeRenderOption: "FORMATTED_STRING",
    });

    res.send(getRows.data);
});


app.post("/addRow", async(req,res)=> {
    const {googleSheets, auth, spreadsheetId} = await getAuthSheets();

    const {values} = req.body

    const row = await googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: "Página1", 
        valueInputOption: "USER_ENTERED",
        resource: {
            values: values, 
        },
    });

    res.send(row.data);
});
app.listen(3001, ()=> console.log("Rodando na porta 3001"))

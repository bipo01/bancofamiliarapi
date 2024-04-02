import express, { response } from "express";
import bodyParser from "body-parser";
import pg from "pg";
import cors from "cors";

const app = express();
const port = 3000;

const db = new pg.Client({
    connectionString:
        "postgres://oenmiezn:k3etNVvNyLND8iTu5vBwFVE6RPm1xCRZ@raja.db.elephantsql.com/oenmiezn",
});

db.connect();

app.use(cors());

app.get("/", async (req, res) => {
    const result = await db.query("SELECT * FROM banco");
    const data = result.rows;

    res.json(data);
});

app.get("/add", (req, res) => {
    console.log(req.query);
    db.query(
        "INSERT INTO banco (owner, username, password) VALUES ($1, $2, $3)",
        [req.query.owner, req.query.username, req.query.password]
    );

    res.json(`${req.query.owner} adicionado ao banco de dados!`);
});

app.get("/movement", async (req, res) => {
    const movements = await db.query(
        "SELECT movements FROM banco WHERE id = $1",
        [req.query.id]
    );

    const dataDosMovimentos = await db.query(
        "SELECT datamovement FROM banco WHERE id = $1",
        [req.query.id]
    );

    let dataMovimento = dataDosMovimentos.rows[0].datamovement;

    let movementsCurrentAcc = movements.rows[0].movements;
    if (!movementsCurrentAcc) {
        db.query(
            `UPDATE banco SET movements = $1, datamovement = $2 WHERE id = $3`,
            [[Number(req.query.mov)], [req.query.dataatual], req.query.id]
        );
    } else {
        console.log(dataMovimento);
        dataMovimento.push(req.query.dataatual);
        console.log(dataMovimento);
        movementsCurrentAcc.push(Number(req.query.mov));

        db.query(
            `UPDATE banco SET movements = $1, datamovement = $2 WHERE id = $3`,
            [movementsCurrentAcc, dataMovimento, req.query.id]
        );
    }

    const conta = await db.query("SELECT * FROM banco WHERE id = $1", [
        req.query.id,
    ]);
    const contaAtual = conta.rows;

    res.json(contaAtual);
});

app.get("/deletar", (req, res) => {
    db.query("DELETE FROM banco WHERE id = $1", [req.query.id]);

    res.json(`ID ${req.query.id} deletada.`);
});

app.listen(port, () => {
    console.log(`Server on port ${port}`);
});

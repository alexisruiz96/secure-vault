import express, {Request, Response, NextFunction} from 'express';
import {json} from 'body-parser'
import todoRoutes from './routes/users'
import { Client } from 'pg';

const client = new Client({
    user: 'kali',
    host: 'localhost',
    database: 'securevault',
    password: 'kali',
    port: 5432,
})
const app = express();

// PostgreSQL connection
const getUsers = async () => {
    await client.connect();

    const res = await client.query('SELECT * FROM USERS');
    const result = res.rows[0].username;
    await client.end();

    return result;
};

getUsers().then(res => {console.log(res)});


app.use(json());

app.use('/users', todoRoutes);

app.use((err: Error, req:Request, res:Response , next: NextFunction)=>{
    res.status(500).json({message: err.message});
})

app.listen(3000);
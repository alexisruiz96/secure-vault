import { Client, Pool } from 'pg';

export const client = new Client({
    user: 'kali',
    host: 'localhost',
    database: 'securevault',
    password: 'kali',
    port: 5432,
})

export const pool = new Pool({
    user: 'kali',
    host: 'localhost',
    database: 'securevault',
    password: 'kali',
    port: 5432,
})
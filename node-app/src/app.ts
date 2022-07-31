import express, {Request, Response, NextFunction} from 'express';
import {json} from 'body-parser'
import userRoutes from './routes/users'


const app = express();

app.use(json());

app.use('/users', userRoutes);

app.use((err: Error, req:Request, res:Response , next: NextFunction)=>{
    res.status(500).json({message: err.message});
})

app.listen(4000, () => {console.log('Server started on port ', 4000)});
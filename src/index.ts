import express, { urlencoded, type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from 'express-rate-limit';
import routes from "./application/routes/routes";
import cookieParser from 'cookie-parser'; // Import cookie-parser
export const app = express()

app.use(helmet())
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}))
const limiter = rateLimit({
    windowMs: 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
});
app.use(limiter)
app.use(cookieParser()); // Add cookie-parser middleware
app.use(express.json())
app.use(urlencoded({ extended: true }))
// routes
app.use('/api', routes);

app.get('/', (req: Request, res: Response) => {
    res.json('Hello World');
});
app.listen(4000, () => {
    console.log('Server running in http://localhost:4000')
})
import express, { urlencoded } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from 'express-rate-limit';
import routes from "./application/routes/routes";
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

app.use(express.json())
app.use(urlencoded({ extended: true }))
// routes
app.use('/api', routes);
// app.use(errorMiddleware);

app.listen(3000, () => {
    console.log('Server running in http://localhost:3000')
})
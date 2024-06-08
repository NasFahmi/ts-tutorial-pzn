import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logging";


export const prismaClient = new PrismaClient({
    // membuat log prisma, jadi setiap ada query, warn, info, dan error maka akan ditampilkan di event yang nanti akan di kirim ke logger
    log: [
        {
            emit: "event",
            level: 'query'
        },
        {
            emit: "event",
            level: 'warn'
        },
        {
            emit: "event",
            level: 'error'
        },
        {
            emit: "event",
            level: 'info'
        }
    ]
});

// mengirim prima log kedalam logger winston
prismaClient.$on('error', (e) => {
    logger.error(e)
})

prismaClient.$on('info', (e) => {
    logger.info(e)
})

prismaClient.$on('warn', (e) => {
    logger.warn(e)
})

prismaClient.$on('query', (e) => {
    logger.info(e)
})
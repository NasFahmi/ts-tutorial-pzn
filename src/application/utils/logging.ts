import Winston from 'winston';

export const logger = Winston.createLogger({
    format: Winston.format.json(),
    level: 'info',
    transports: [
        new Winston.transports.Console({})
    ]
})
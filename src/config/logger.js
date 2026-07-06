import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine((
    winston.format.timestamp(), // para saber cuando se genero el log
    winston.format.errors({ stack: true }), // para incluir el stack trace en los logs de errores
    winston.format.json() 
  )),
  defaultMeta: { service: 'acquisition-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});


if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )  }));
}

export default logger;

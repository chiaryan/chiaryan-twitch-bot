const {format, transports, ...winston} = require("winston");

winston.configure({
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    }),
    new transports.File({
      filename: "logs.txt",
      format: format.combine(
        format.timestamp({
          format: "DD/MM/YYYY hh:mm A"
        }),
        format.json()
      )
    })
  ]
})
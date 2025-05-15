import fs from 'fs';

export function logReqRes(filename) {
  return (req, res, next) => {
    const now = new Date().toLocaleString(); // Converts to readable format like '5/14/2025, 10:30:15 AM'
    const log = `\n[${now}] ${req.ip} ${req.method} ${req.path}`;

    fs.appendFile(filename, log, (err) => {
      if (err) {
        console.log("error writing log file", err);
      }
      next(); //here there is no other middleware so next is routes
    });
  };
}

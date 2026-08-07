const logger = {
  info: (message) => {
    const log = `[INFO] ${new Date().toISOString()} - ${message}`;
    console.log(log);
  },
  error: (message) => {
    const log = `[ERROR] ${new Date().toISOString()} - ${message}`;
    console.error(log);
  }
};

module.exports = logger;
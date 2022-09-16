require('dotenv').config();
module.exports = {
  development: {
    username: process.env.MYSQL_NAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.DATEBASE,
    host: process.env.HOST,
    dialect: 'mysql',
    logging: false,
    timezone: '+09:00',
    dialectOptions: {
      dateStrings: true,
      typeCast: true,
    },
  },
  test: {
    username: 'root',
    password: null,
    database: 'database_test',
    host: '127.0.0.1',
    dialect: 'mysql',
  },
  production: {
    username: 'root',
    password: null,
    database: 'database_production',
    host: '127.0.0.1',
    dialect: 'mysql',
  },
};

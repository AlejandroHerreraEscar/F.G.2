require('dotenv').config();
process.env.DB_SERVER = 'localhost';  // Ajusta según tu servidor
process.env.DB_DATABASE = 'Boletas';

const express = require('express');
const sql = require('mssql');

const app = express();
const PORT = 3000;

app.use(express.json());

const dbConfig = {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        driver: 'msnodesqlv8',
        trustedConnection: true,       // Activar autenticación de Windows
        trustServerCertificate: true   // Evita problemas de certificado
    },
    connectionTimeout: 15000,          // Tiempo de espera de 15 segundos
    requestTimeout: 30000              // Tiempo de espera de 30 segundos para solicitudes
};

// Intentar la conexión
try {
    sql.connect(dbConfig, (err) => {
        if (err) {
            console.error('Error al conectar con SQL Server:', err);
        } else {
            console.log('Conectado a SQL Server con autenticación de Windows');
        }
    });
} catch (error) {
    console.error("Error crítico en la conexión a SQL Server:", error);
}

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});


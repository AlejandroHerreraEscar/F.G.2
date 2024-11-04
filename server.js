require('dotenv').config();
const express = require('express');
const sql = require('mssql');

const app = express();
const PORT = 3000;

app.use(express.json()); // Para manejar datos JSON

// Configuración de la base de datos SQL Server con autenticación de Windows
const dbConfig = {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        driver: 'msnodesqlv8',            // Controlador para autenticación de Windows
        trustedConnection: true,          // Habilita la autenticación de Windows
        trustServerCertificate: true      // Para evitar errores de certificado
    }
};

// Conectar a SQL Server
sql.connect(dbConfig, (err) => {
    if (err) {
        console.error('Error al conectar con SQL Server:', err);
    } else {
        console.log('Conectado a SQL Server con autenticación de Windows');
    }
});

// Ejemplo de ruta para agregar boletas (POST)
app.post('/api/boletas', async (req, res) => {
    const { usuarioID, fecha, total, comercio, detalles } = req.body;
    
    try {
        const result = await sql.query`
            INSERT INTO Boletas (UsuarioID, Fecha, Total, Comercio)
            OUTPUT INSERTED.BoletaID
            VALUES (${usuarioID}, ${fecha}, ${total}, ${comercio});
        `;

        const boletaID = result.recordset[0].BoletaID;

        for (const detalle of detalles) {
            await sql.query`
                INSERT INTO Detalles_Boleta (BoletaID, Producto, Cantidad, Precio_Unitario)
                VALUES (${boletaID}, ${detalle.producto}, ${detalle.cantidad}, ${detalle.precio_unitario});
            `;
        }

        res.status(201).json({ message: 'Boleta y detalles guardados exitosamente' });
    } catch (error) {
        console.error('Error al guardar boleta:', error);
        res.status(500).json({ error: 'Error al guardar la boleta' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

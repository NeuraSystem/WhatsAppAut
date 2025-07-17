// src/auth/admin.js

require('dotenv').config();
const { pool } = require('../database/pg'); // Importar la conexión a PostgreSQL

/**
 * Verifica si un número de teléfono corresponde a un administrador activo en la base de datos.
 * @param {string} phoneNumber - El número de teléfono a verificar (ej: '5491123456789@c.us').
 * @returns {Promise<boolean>} - True si el número es de un admin activo, false en caso contrario.
 */
async function isAdmin(phoneNumber) {
    try {
        if (!phoneNumber) {
            return false;
        }

        // Limpiar el número para quitar el sufijo de WhatsApp
        const cleanNumber = phoneNumber.split('@')[0];

        const result = await pool.query(
            'SELECT * FROM admin_users WHERE numero_telefono = $1 AND activo = true',
            [cleanNumber]
        );
        
        return result.rows.length > 0;
    } catch (error) {
        console.error('Error al consultar la base de datos:', error.message);
        throw error;
    }
}

/**
 * Agrega un nuevo administrador a la base de datos.
 * @param {string} phoneNumber - El número de teléfono del nuevo admin.
 * @param {string} nombre - El nombre del nuevo admin.
 * @returns {Promise<void>}
 */
async function addAdmin(phoneNumber, nombre) {
    try {
        const cleanNumber = phoneNumber.split('@')[0];
        
        const result = await pool.query(
            'INSERT INTO admin_users (numero_telefono, nombre) VALUES ($1, $2) RETURNING id',
            [cleanNumber, nombre]
        );
        
        console.log(`Admin ${nombre} (${cleanNumber}) agregado con éxito. ID: ${result.rows[0].id}`);
    } catch (error) {
        console.error('Error al agregar nuevo admin:', error.message);
        throw error;
    }
}

/**
 * Desactiva un administrador en la base de datos.
 * @param {string} phoneNumber - El número de teléfono del admin a desactivar.
 * @returns {Promise<void>}
 */
async function removeAdmin(phoneNumber) {
    try {
        const cleanNumber = phoneNumber.split('@')[0];
        
        const result = await pool.query(
            'UPDATE admin_users SET activo = false WHERE numero_telefono = $1',
            [cleanNumber]
        );
        
        if (result.rowCount > 0) {
            console.log(`Admin con número ${cleanNumber} desactivado con éxito.`);
        } else {
            console.log(`No se encontró un admin activo con el número ${cleanNumber}.`);
        }
    } catch (error) {
        console.error('Error al desactivar admin:', error.message);
        throw error;
    }
}


module.exports = {
    isAdmin,
    addAdmin,
    removeAdmin
};

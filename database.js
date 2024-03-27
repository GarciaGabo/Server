import mysql from 'mysql2';
import dotenv from 'dotenv';
import fs from "fs";
dotenv.config();

const pool = mysql
.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
})
.promise();
// Querys Tabla Usuarios
export async function InsertUser(nombre,apellidos,domicilio,clave_electoral,contraseña) {
    try {
        await pool.query(`START TRANSACTION`);
        const [result] = await pool.query(
            `INSERT INTO usuarios(nombre,apellidos,domicilio,clave_electoral,contraseña) VALUES (?, ?, ?, ?, ?)`,
            [nombre,apellidos,domicilio,clave_electoral,contraseña]
        );
        await pool.query('COMMIT');
        const id = result.insertId;
        return id;
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error("Error al insertar usuario:", error);
    }
}
export async function getClaveUsuario(clave_electoral) {
    try {
        const [result] = await pool.query(
            `SELECT * FROM usuarios WHERE clave_electoral = ?`,
            [clave_electoral]
        );
        if (result.length > 0) {
            const clave_electoral = result[0].clave_electoral;
            return clave_electoral;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error al obtener la clave:", error);
    }
}
export async function getClaveUsuarioUnico(id_usuario,clave_electoral) {
    try {
        const [result] = await pool.query(
            `SELECT clave_electoral FROM usuarios WHERE clave_electoral=? AND id_usuario != ?`,
            [clave_electoral,id_usuario]
        );
        if (result.length > 0) {
            const clave_electoral = result[0].clave_electoral;
            return clave_electoral;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error al obtener la clave:", error);
    }
}

export async function getUsers(){
    try{
        const [row] = await pool.query(`SELECT usuarios.*, vehiculo.*
        FROM usuarios
        JOIN vehiculo ON usuarios.id_usuario = vehiculo.id_usuario;
        `);
        return row;
    }
    catch(error){
        console.error(error);
    }
}

export async function deleteUsuarios(id_usuario){
    try{
        const [result] = await pool.query(`DELETE FROM usuarios WHERE id_usuario = ?;`,
        [id_usuario]
        );
        await pool.query('COMMIT');
        return result;
    }catch(error){
        await pool.query('ROLLBACK');
        console.error("Error al eliminar el usuario:", error);
    }
}
//Querys Tabla de Vehiculos
export async function InsertVehicle(placa,no_serie,marca,modelo,color,id_usuario) {
    try {
        const [result] = await pool.query(
            `INSERT INTO vehiculo(placa,no_serie,marca,modelo,color,id_usuario) VALUES (?, ?, ?, ?, ?, ?)`,
            [placa,no_serie,marca,modelo,color,id_usuario]
        );
        await pool.query('COMMIT');
        const id = result.insertId;
        return id;
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error(error);
    }
}
export async function getPlaca(placa){
    try {
        const [result] = await pool.query(
            `SELECT * FROM vehiculo WHERE placa = ?`,
            [placa]
        );
        if (result.length > 0) {
            const placa = result[0].placa;
            return placa;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error al obtener la placa:", error);
    }
}
export async function getPlacaUnico(id_usuario,placa){
    try {
        const [result] = await pool.query(
            `SELECT placa FROM vehiculo WHERE placa=? AND id_usuario != ?`,
            [placa,id_usuario]
        );
        if (result.length > 0) {
            const placa = result[0].placa;
            return placa;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error al obtener la placa:", error);
    }
}
export async function getNoSerie(no_serie){
    try {
        const [result] = await pool.query(
            `SELECT * FROM vehiculo WHERE no_serie = ?`,
            [no_serie]
        );
        if (result.length > 0) {
            const no_serie = result[0].no_serie;
            return no_serie;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error al obtener el no de serie:", error);
    }
}
export async function getNoSerieUnico(id_usuario,no_serie){
    try {
        const [result] = await pool.query(
            `SELECT no_serie FROM vehiculo WHERE no_serie=? AND id_usuario != ?`,
            [no_serie,id_usuario]
        );
        if (result.length > 0) {
            const no_serie = result[0].no_serie;
            return no_serie;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error al obtener el no de serie:", error);
    }
}

export async function deleteVehicle(id_usuario){
    try{
        await pool.query(`START TRANSACTION`);
        await deleteQr(id_usuario);
        const [result] = await pool.query(`DELETE FROM vehiculo WHERE id_usuario = ?;`,
        [id_usuario]
        );
        await pool.query('COMMIT');
        return result;
    }catch(error){
        await pool.query('ROLLBACK');
        console.error("Error al eliminar el vehiculo:", error);
    }
}
export async function getPlaca_NoSerie(placa,no_serie){
    try {
        const [result] = await pool.query(
            `SELECT id_vehiculo FROM vehiculo WHERE placa = ? AND no_serie = ?;`,
            [placa,no_serie]
        );
        if (result.length > 0) {
            const id_vehiculo = result[0].id_vehiculo;
            return id_vehiculo;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error al obtener el id del vehiculo:", error);
    }
}

//Querys Tabla de Administradores
export async function InsertAdmin(tipo_usuario,nombre,apellidos,domicilio,clave_electoral_pri,contrasena){
    try {
        const [result] = await pool.query(
            `INSERT INTO usuario_pri (tipo_usuario,nombre,apellidos,domicilio,clave_electoral_pri,contrasena) VALUES(?,?,?,?,?,?)`,
            [tipo_usuario,nombre,apellidos,domicilio,clave_electoral_pri,contrasena]
        );
    } catch(error) {
        
    }
}

export async function getClaveElectoral(clave_electoral_pri) {
    try {
        const [result] = await pool.query(
            `SELECT * FROM usuario_pri WHERE clave_electoral_pri = ?`,
            [clave_electoral_pri]
        );
        if (result.length > 0) {
            const clave_electoral = result[0].clave_electoral_pri;
            return clave_electoral;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error getting email:", error);
    }
}
export async function getClaveAdminUnico(clave_electoral_pri,id_usuario_p) {
    try {
        const [result] = await pool.query(
            `SELECT clave_electoral_pri FROM usuario_pri WHERE clave_electoral_pri=? AND id_usuario_p != ?`,
            [clave_electoral_pri,id_usuario_p]
        );
        if (result.length > 0) {
            const clave_electoral_pri = result[0].clave_electoral_pri;
            return clave_electoral_pri;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error al obtener la clave:", error);
    }
}

export async function getAdmins(){
    try{
        const[row] = await pool.query(`SELECT * FROM usuario_pri`);
        return row;
    } catch(error){
        console.error(error);
    }
}

export async function deleteAdmins(id_usuario_p) {
    try {
        await pool.query('START TRANSACTION');
        await pool.query('SET FOREIGN_KEY_CHECKS = 0;');
        const [result] = await pool.query('DELETE FROM usuario_pri WHERE id_usuario_p = ?', [id_usuario_p]);
        await pool.query('COMMIT');
        return result;
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error al eliminar el administrador:', error);
        throw error;
    }
}

export async function UpdateAdmins(id_usuario_pri, tipo_usuario, nombre, apellidos, domicilio, clave_electoral_pri, contrasena) {
    try {
        const [result] = await pool.query(
            `UPDATE usuario_pri SET tipo_usuario=?, nombre=?, apellidos=?, domicilio=?, clave_electoral_pri=?, contrasena=? WHERE id_usuario_p=?`,
            [tipo_usuario, nombre, apellidos, domicilio, clave_electoral_pri, contrasena, id_usuario_pri]
        );
        return result;
    } catch (error) {
        console.error("Error al actualizar administrador:", error);
    }
}
//Querys Qr
export async function InsertQr(idVehicle,rutaCodigoQR) {
    try {
        const [result] = await pool.query(
            `INSERT INTO qr(id_vehiculo,qr) VALUES (?, ?)`,
            [idVehicle,rutaCodigoQR]
        );
        await pool.query('COMMIT');
        const id = result.insertId;
        return id;
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error(error);
    }
}

export async function deleteQr(id_usuario){
    try{
        const [result0] = await pool.query(`SELECT qr FROM qr WHERE id_vehiculo IN (SELECT id_vehiculo FROM vehiculo WHERE id_usuario = ?);`, [id_usuario]);
        if (result0.length > 0) {
            const rutaArchivoQR = result0[0].qr;
            fs.unlinkSync(rutaArchivoQR);
        }
        const [result] = await pool.query(`DELETE FROM qr WHERE id_vehiculo IN (SELECT id_vehiculo FROM vehiculo WHERE id_usuario = ?);`,
        [id_usuario]);
        await pool.query('COMMIT');
        return result;
    }catch(error){
        await pool.query('ROLLBACK');
        console.error("Error al eliminar el vehiculo:", error);
    }
}
export async function IdQr(id_vehiculo){
    try {
        const [result] = await pool.query(
            `SELECT id_qr FROM qr WHERE id_vehiculo = '?';`,
            [id_vehiculo]
        );
        if (result.length > 0) {
            const id_qr = result[0].id_qr;
            return id_qr;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error al obtener el id del vehiculo:", error);
    }
}

//
export async function updateUsuario(id_usuario, nombre, apellidos, domicilio, clave_electoral, contraseña) {
    try {
        await pool.query(`START TRANSACTION`);
        const [result] = await pool.query(
            `UPDATE usuarios SET nombre=?, apellidos=?, domicilio=?, clave_electoral=?, contraseña=? WHERE id_usuario=?`,
            [nombre, apellidos, domicilio, clave_electoral, contraseña, id_usuario]
        );
        await pool.query('COMMIT');
        return result;
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error("Error al actualizar usuario:", error);
    }
}

export async function updateVehiculo(id_usuario, placa, no_serie, marca, modelo, color) {
    try {
        const [result] = await pool.query(
            `UPDATE vehiculo SET placa=?, no_serie=?, marca=?, modelo=?, color=? WHERE id_usuario=?`,
            [placa, no_serie, marca, modelo, color, id_usuario]
        );
        if(result){
            const [updatedVehiculo] = await pool.query(
                `SELECT id_vehiculo FROM vehiculo WHERE id_usuario=?`,
                [id_usuario]
            );
            if (updatedVehiculo.length > 0) {
                await pool.query('COMMIT');
                return updatedVehiculo[0].id_vehiculo;
            } else {
                await pool.query('ROLLBACK');
                console.error("No se encontró ningún vehículo actualizado.");
                return null;
            }
        }
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error("Error al actualizar vehículo:", error);
        return null;
    }
}

export async function updateQr(id_vehiculo, rutaCodigoQR) {
    try {
        const [result] = await pool.query(
            `UPDATE qr SET qr=? WHERE id_vehiculo=?`,
            [rutaCodigoQR, id_vehiculo]
        );
        await pool.query('COMMIT');
        return result;
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error("Error al actualizar QR:", error);
    }
}
//Login
export async function LoginAdmins(clave_electoral, contrasena) {
    try {
        const [rows] = await pool.query(`SELECT * FROM usuario_pri WHERE clave_electoral_pri=? AND contrasena=?`, [clave_electoral, contrasena]);
        if (rows.length > 0) {
            return rows[0];
        } else {
            return null;
        }
    } catch (error) {
        console.error(error);
    }
}
export async function LoginUsers(clave_electoral, contrasena) {
    try {
        const [rows] = await pool.query(`SELECT usuarios.*, vehiculo.*, qr.*
            FROM usuarios
            JOIN vehiculo ON usuarios.id_usuario = vehiculo.id_usuario
            JOIN qr ON vehiculo.id_vehiculo = qr.id_vehiculo
            WHERE usuarios.clave_electoral = ? AND usuarios.contraseña = ?`,
            [clave_electoral, contrasena]);
        if (rows.length > 0) {
            return rows[0];
        } else {
            return null;
        }
    } catch (error) {
        console.error(error);
    }
}
//Querys Historial
export async function Hour_Register(id_usuario_p,id_qr,estado) {
    try {
        const [result] = await pool.query(
            `INSERT INTO historial (hora, estado, id_qr, id_usuario_p)
            VALUES (CURRENT_TIMESTAMP, ?, ?, ?);`,
            [estado,id_qr,id_usuario_p]
        );
        const id = result.insertId;
        return id;
    } catch (error) {
        console.error(error);
    }
}
export async function Hour_Entry(id_usuario_p,id_qr) {
    try {
        const [result] = await pool.query(
            `INSERT INTO historial (hora, estado, id_qr, id_usuario_p)
            VALUES (CURRENT_TIMESTAMP, 'Entrada', ?, ?);`,
            [id_qr,id_usuario_p]
        );
        const id = result.insertId;
        return id;
    } catch (error) {
        console.error(error);
    }
}
export async function getHistory(){
    try{
        const[row] = await pool.query(`SELECT * FROM historial`);
        return row;
    } catch(error){
        console.error(error);
    }
}
export async function Verify_Hour(id_qr){
    try{
        const[rows] = await pool.query('SELECT estado, hora FROM historial WHERE id_qr = ? ORDER BY hora DESC LIMIT 1;',
        [id_qr]);
        if (rows.length > 0) {
            return rows[0];
        } else {
            return null;
        }
    } catch(error){
        console.error(error);
    }
}
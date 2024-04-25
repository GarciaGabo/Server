import express from "express";
import fs from "fs";
import qr from "qrcode";
import multer from "multer";
import path from "path";
import {
    InsertAdmin,
    InsertUser,
    InsertVehicle,
    InsertPhoto,
    deleteAdmins,
    deleteUsuarios,
    getAdmins,
    getClaveElectoral,
    getClaveUsuario,
    getPlaca,
    getUsers,
    getNoSerie,
    deleteVehicle,
    UpdateAdmins,
    InsertQr,
    updateUsuario,
    updateVehiculo,
    updateQr,
    getClaveUsuarioUnico,
    getPlacaUnico,
    getNoSerieUnico,
    LoginAdmins,
    LoginUsers,
    getPlaca_NoSerie,
    IdQr,
    Hour_Register,
    Hour_Entry,
    getHistory,
    deleteQr,
    getClaveAdminUnico,
    Verify_Hour,
    getUser_Vehicles,
} from "./database.js";
import cors from 'cors';

const corsOptions = {
    methods: ["POST","GET"],
    credentials: true,
};
const app = express();
app.use(express.json());
app.use(cors(corsOptions));
app.use(express.static('imgs'));
app.use(express.static('fotos'));

app.listen(8080, () => {
    console.log('Server running');
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'fotos/')
    },
    filename: function (req, file, cb) {
        const imageName = file.originalname;
        cb(null, imageName)
    }
})

const upload = multer({ storage: storage }).single('imagen');

app.post('/subir-imagen', upload, (req, res) => {
    const imageName = req.file.originalname;
    const insertFoto = InsertPhoto(imageName);
    if(insertFoto){
        res.status(201).send({ message: "Se han registrado correctamente" });
    }
});

// Función para generar el código QR
async function generarCodigoQR(datosUsuario, datosVehiculo) {
    try {
        const datosCodigoQR = `Nombre:${datosUsuario.nombre}\nApellidos:${datosUsuario.apellidos}\nDomicilio:${datosUsuario.domicilio}\nClave Electoral:${datosUsuario.clave_electoral}\nPlaca:${datosVehiculo.placa}\nNo Serie:${datosVehiculo.no_serie}\nMarca:${datosVehiculo.marca}\nModelo:${datosVehiculo.modelo}\nColor:${datosVehiculo.color}`;
        const rutaCodigoQR = `imgs/${datosUsuario.clave_electoral}_${datosVehiculo.placa}_${datosVehiculo.no_serie}.png`; // Modifica la ruta si deseas incluir información adicional en el nombre del archivo
        await qr.toFile(rutaCodigoQR, datosCodigoQR);
        return rutaCodigoQR;
    } catch (error) {
        console.error("Error al generar el código QR:", error);
        console(error);
    }
}

// Ruta para servir la imagen
app.get("/imagen/:nombreImagen", (req, res) => {
    const nombreImagen = req.params.nombreImagen;
    const rutaImagen = path.join(__dirname, "imgs", nombreImagen);
    res.sendFile(rutaImagen);
});

app.get("/foto/:nombreImagen", (req, res) => {
    const nombreImagen = req.params.nombreImagen;
    const rutaImagen = path.join(__dirname, "fotos", nombreImagen);

    fs.access(rutaImagen, fs.constants.F_OK, (err) => {
        if (err) {
            res.status(404).send("File not found");
        } else {
            res.sendFile(rutaImagen);
        }
    });
});

// Registro de Usuarios
app.post("/usuarios", async (req, res) => {
    try {
        const { nombre, apellidos, domicilio, clave_electoral, contraseña, vehiculos } = req.body;

        const claveExistente = await getClaveUsuario(clave_electoral);
        const claveExistentepri = await getClaveElectoral(clave_electoral);
        
        if (claveExistente || claveExistentepri) {
            return res.status(400).send({ message: "La clave electoral ya existe" });
        }

        const placasProcesadas = new Set();
        const numerosSerieProcesados = new Set();

        for (const vehiculo of vehiculos) {
            const { placa, no_serie, marca, modelo, color } = vehiculo;

            if (await getPlaca(placa)) {
                return res.status(400).send({ message: "La placa ya existe" });
            }

            if (await getNoSerie(no_serie)) {
                return res.status(400).send({ message: "El número de serie ya existe" });
            }

            if (placasProcesadas.has(placa)) {
                return res.status(400).send({ message: "La placa coincide" });
            } else {
                placasProcesadas.add(placa);
            }

            if (numerosSerieProcesados.has(no_serie)) {
                return res.status(400).send({ message: "El número de serie coincide" });
            } else {
                numerosSerieProcesados.add(no_serie);
            }
        }

        const usuarioInsertado = await InsertUser(nombre, apellidos, domicilio, clave_electoral, contraseña);
        if (!usuarioInsertado) {
            return res.status(400).send({ message: "Error al insertar el usuario" });
        }

        for (const vehiculo of vehiculos) {
            const { placa, no_serie, marca, modelo, color } = vehiculo;
            const rutaCodigoQR = await generarCodigoQR(req.body, vehiculo);

            const vehiculoInsertado = await InsertVehicle(placa, no_serie, marca, modelo, color, usuarioInsertado);
            if (!vehiculoInsertado) {
                return res.status(400).send({ message: "Error al insertar el vehículo" });
            }

            const qrInsertado = await InsertQr(vehiculoInsertado, rutaCodigoQR);
            if (!qrInsertado) {
                return res.status(400).send({ message: "Error al insertar el QR" });
            }
        }

        res.status(201).send({ message: "Se han registrado correctamente" });
    } catch (error) {
        res.status(500).send({ message: "Error interno del servidor" + error });
    }
});

// Registro de Administradores
app.post("/RegisterAdmins", async (req,res)=>{
    try{
        const { tipo_usuario,nombre,apellidos,domicilio,clave_electoral_pri,contrasena } = req.body;
        const existingClaveAdmin = await getClaveElectoral(clave_electoral_pri);
        const existingClaveUser = await getClaveUsuario(clave_electoral_pri)
        if (existingClaveAdmin || existingClaveUser) {
            return res.status(400).send({ message: "La clave electoral ya existe" });
        }

        const result = await InsertAdmin(tipo_usuario,nombre,apellidos,domicilio,clave_electoral_pri, contrasena);
        res.status(201).send({ message:"Se ha registrado correctamente"});
    } catch(error){
        res.status(500).send("No se ha registrado");
    }
})
//Obtencion de Administradores
app.get("/getAdmins", async (req, res)=>{
    try{
        const result = await getAdmins(req.params);
        res.status(200).send(result);
    } catch(error){
        
    }
})
//Eliminacion de Administradores
app.delete("/deleteAdmins/:id_usuario_p", async (req, res) => {
    try{
        const { id_usuario_p } = req.body;
        await deleteAdmins(req.params.id_usuario_p, id_usuario_p);
        res.status(200).send({message:'Se ha eliminado correctamente'});
    }catch(error){
        res.status(500).send({message:'Error al eliminar el administrador'});
    }
});
//Modificacion de Administradores
app.put("/UpdateAdmins", async (req,res)=>{
    try{
        const { id_usuario_pri,tipo_usuario, nombre, apellidos, domicilio, clave_electoral_pri, contrasena } = req.body;
        const existingClaveUser = await getClaveUsuario(clave_electoral_pri);
        const existingClaveAdmin = await getClaveAdminUnico(clave_electoral_pri,id_usuario_pri);
        if (existingClaveUser || existingClaveAdmin) {
            res.status(400).send({ message: "La clave electoral ya existe" });
        }
        else{
            const result = await UpdateAdmins(id_usuario_pri, tipo_usuario, nombre, apellidos, domicilio, clave_electoral_pri, contrasena);
            res.status(200).send({ message:"Se ha actualizado correctamente"});
        }
    } catch(error){
        console.error(error);
        res.status(500).send("No se ha actualizado");
    }
})
//Modificacion de Usuarios
app.put("/UpdateUsers", async (req, res) => {
    try {
        const { id_usuario, nombre, apellidos, domicilio, clave_electoral, contrasena, vehiculos } = req.body;

        const claveExistente = await getClaveUsuarioUnico(id_usuario,clave_electoral);
        const claveExistentepri = await getClaveElectoral(clave_electoral);

        if (claveExistente || claveExistentepri) {
            return res.status(400).send({ message: "La clave electoral ya existe" });
        }

        const placasProcesadas = new Set();
        const numerosSerieProcesados = new Set();

        for (const vehiculo of vehiculos) {
            const { placa, no_serie } = vehiculo;

            if (await getPlacaUnico(id_usuario,placa)) {
                return res.status(400).send({ message: "La placa ya existe" });
            }

            if (await getNoSerieUnico(id_usuario,no_serie)) {
                return res.status(400).send({ message: "El número de serie ya existe" });
            }

            if (placasProcesadas.has(placa)) {
                return res.status(400).send({ message: "La placa coincide" });
            } else {
                placasProcesadas.add(placa);
            }

            if (numerosSerieProcesados.has(no_serie)) {
                return res.status(400).send({ message: "El número de serie coincide" });
            } else {
                numerosSerieProcesados.add(no_serie);
            }
        }

        const usuarioActualizado = await updateUsuario(id_usuario, nombre, apellidos, domicilio, clave_electoral, contrasena);
        if (!usuarioActualizado) {
            return res.status(400).send({ message: "Error al actualizar el usuario" });
        }

        for (const vehiculo of vehiculos) {
            const { id_vehiculo, placa, no_serie, marca, modelo, color } = vehiculo;
            const rutaCodigoQR = await generarCodigoQR(req.body, vehiculo);

            const vehiculoActualizado = await updateVehiculo(id_usuario, placa, no_serie, marca, modelo, color, id_vehiculo);

            if (!vehiculoActualizado) {
                return res.status(400).send({ message: "Error al actualizar el vehículo" });
            }

            const qrActualizado = await updateQr(vehiculoActualizado, rutaCodigoQR);
            if (!qrActualizado) {
                return res.status(400).send({ message: "Error al actualizar el QR" });
            }
        }

        res.status(200).send({ message: "Se han actualizado correctamente" });
    } catch (error) {
        res.status(500).send({ message: "Error interno del servidor" + error });
    }
});

//Obtencion de Usuarios
app.get("/getUsuarios", async (req, res)=>{
    try{
        const result = await getUsers(req.params);
        res.status(200).send(result);
    } catch(error){
        
    }
});
//Eliminacion de usuarios
app.delete("/deleteUsers/:id_usuario", async (req, res) => {
    try{
        const { id_usuario } = req.body;
        const result = await deleteVehicle(req.params.id_usuario, id_usuario);
        if(result){
            const result1 = await deleteUsuarios(req.params.id_usuario, id_usuario);
            if(result1){
                res.status(200).send({message:'Se ha eliminado correctamente'});
            }
            else{
                res.status(500).send({message:'Error al eliminar el vehiculo'});
            }
        }
        else{
            res.status(500).send({message:'Error al eliminar el usuario'});
        }
    }catch(error){
        res.status(500).send({message:'Error al eliminar el usuario'});
    }
});
//Login
app.post('/Login', async (req, res)=>{
    try{
        const {clave_electoral,contrasena} = req.body;
        const datos = await LoginAdmins(clave_electoral,contrasena);
        if(datos){
            res.status(200).send(datos);
        }
        else{
            const data = await LoginUsers(clave_electoral,contrasena);
            if(data){
                res.status(200).send(data);
            }
            else{
                res.status(500).send({message:'Usuario y Contrasena Incorrectos'});
            }
        }
    } catch(error){
        res.status(500).send({message:'Error interno del servidor'});
    }
});
app.post('/LoginUser', async (req, res)=>{
    try{
        const {clave_electoral, contrasena} = req.body;
        const datos = await LoginUsers(clave_electoral, contrasena);
        if(datos){
            res.status(200).send(datos);
        }
        else{
            res.status(500).send({message:'Usuario o Contraseña Incorrectos'});
        }
    } catch(error){
        res.status(500).send({message:'Error interno del servidor'});
    }
});
//Registro qr
app.post('/RegisterQr', async (req, res)=>{
    try{
        const { id_usuario_p,no_serie,placa } = req.body;
        const id_vehiculo = await getPlaca_NoSerie(placa,no_serie);
        if(id_vehiculo){
            const id_qr = await IdQr(id_vehiculo);
            if(id_qr){
                const datos = await Verify_Hour(id_qr);
                if(datos){
                    if(datos.estado == 'Entrada'){
                        const salida = 'Salida';
                        await Hour_Register(id_usuario_p,id_qr,salida);
                        res.status(200).send({message:'Se ha registrado la salida'});
                    }
                    else {
                        const entrada = 'Entrada';
                        await Hour_Register(id_usuario_p,id_qr,entrada);
                        res.status(200).send({message:'Se ha registrado la entrada'});
                    }
                }
                else{
                    await Hour_Entry(id_usuario_p,id_qr);
                    res.status(200).send({message:'Se ha registrado la entrada'});
                }
            }
        }
    } catch(error){
        res.status(500).send({message:'No se ha podido registrar'});
    }
})
//Obtencion del Historial
app.get("/getHistory", async (req, res)=>{
    try{
        const result = await getHistory(req.params);
        res.status(200).send(result);
    } catch(error){
        
    }
});

app.get("/getUserVehicle/:id_usuario", async (req, res)=>{
    try{
        const { id_usuario } = req.params;
        const result = await getUser_Vehicles(id_usuario);
        res.status(200).send(result);
    } catch(error){
        
    }
});
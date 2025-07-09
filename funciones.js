// Variables globales para manejar archivos y resultados
let archivos = [];
let erroresTotales = [];
let totalVolumenCompras = 0;
let totalVolumenVentas = 0;
let totalImporteVentas = 0;
let totalCorrectos = 0;
let totalErrores = 0;

// Referencias a elementos del DOM
const adjuntarArchivo = document.getElementById('adjuntarArchivo');
const dropArea = document.getElementById('dropArea');
const erroresTitulo = document.getElementById("erroresTitulo");
const listadoErorresNombreArchivo = document.getElementById('listadoErorresNombreArchivo');
const fechaDelArchivo = document.getElementById('fechaDelArchivo');
const sumaVolumenCompras = document.getElementById('sumaVolumenCompras');
const sumaVolumenVentas = document.getElementById('sumaVolumenVentas');
const sumaImporteVentas = document.getElementById('sumaImporteVentas');
const nombreArchivoImpreso = document.getElementById("nombreArchivoImpreso");
const botonLimpiar = document.getElementById("botonLimpiar");

// Evento cuando se seleccionan archivos por input
adjuntarArchivo.addEventListener('change', async () => {
    archivos = Array.from(adjuntarArchivo.files);
    await procesarArchivos();
});

// Eventos para manejo de archivos arrastrados al área
dropArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropArea.style.borderColor = '#005BB5';
});
dropArea.addEventListener('dragleave', () => {
    dropArea.style.borderColor = '#0087F7';
});
dropArea.addEventListener('drop', async (event) => {
    event.preventDefault();
    dropArea.style.borderColor = '#0087F7';
    archivos = Array.from(event.dataTransfer.files);
    await procesarArchivos();
});

// Función principal para validar y procesar múltiples archivos ZIP
async function procesarArchivos() {
    // Mostrar el spinner de carga
    document.getElementById('cargando').classList.remove('oculto');

    // Reiniciar variables
    erroresTotales = [];
    totalVolumenCompras = 0;
    totalVolumenVentas = 0;
    totalImporteVentas = 0;
    totalCorrectos = 0;
    totalErrores = 0;

    // Variables para mostrar información si es un solo archivo válido
    let archivoUnicoValido = null;
    let nombreArchivoUnico = '';
    let fechaArchivoUnico = '';

    // Recorrer todos los archivos cargados
    for (const archivo of archivos) {
        const errores = validarNombreDeArchivoZip(archivo.name);

        if (errores.length === 0 && archivo.name.endsWith('.zip')) {
            try {
                // Si solo se subió un archivo, guardar su info
                if (archivos.length === 1) {
                    archivoUnicoValido = archivo;
                    nombreArchivoUnico = archivo.name;
                    fechaArchivoUnico = archivo.name.split("_")[4];
                }

                // Leer y acumular datos del ZIP
                await leerArchivoZIP(archivo);
                totalCorrectos++;
            } catch (error) {
                erroresTotales.push(`<strong>${archivo.name}</strong>: Error leyendo ZIP (${error.message})`);
                totalErrores++;
            }
        } else {
            // Guardar errores de validación
            erroresTotales.push(`<strong>${archivo.name}</strong>:<ul>` + errores.map(e => `<li>${e}</li>`).join('') + '</ul>');
            totalErrores++;
        }
    }

    // Ocultar spinner de carga
    document.getElementById('cargando').classList.add('oculto');

    // Ocultar elementos innecesarios
    dropArea.style.display = "none";
    adjuntarArchivo.classList.add("oculto");

    // Mostrar resultados generales
    fechaDelArchivo.classList.remove("oculto");
    sumaVolumenCompras.classList.remove("oculto");
    sumaVolumenVentas.classList.remove("oculto");
    sumaImporteVentas.classList.remove("oculto");
    botonLimpiar.classList.remove("oculto");

    // Mostrar listado de errores si hay
    if (erroresTotales.length > 0) {
        listadoErorresNombreArchivo.innerHTML = erroresTotales.join("<hr>");
        erroresTitulo.classList.remove("oculto");
        listadoErorresNombreArchivo.classList.remove("oculto");
    }

    // Si es un solo archivo válido, mostrar su nombre y fecha
    if (archivoUnicoValido) {
        fechaDelArchivo.textContent = `La fecha del archivo es: ${fechaArchivoUnico}`;
        nombreArchivoImpreso.textContent = `El nombre del archivo es: ${nombreArchivoUnico}`;
        nombreArchivoImpreso.classList.remove("oculto");
    } else {
        // Si son varios archivos, mostrar resumen de resultados
        fechaDelArchivo.textContent = `Se procesaron ${archivos.length} archivos: ✅ ${totalCorrectos} válidos, ❌ ${totalErrores} con error`;
        nombreArchivoImpreso.classList.add("oculto");
    }

    // Mostrar las sumas acumuladas
    sumaVolumenCompras.textContent = `Suma total volumen compras: ${totalVolumenCompras.toFixed(3)}`;
    sumaVolumenVentas.textContent = `Suma total volumen ventas: ${totalVolumenVentas.toFixed(3)}`;
    sumaImporteVentas.textContent = `Suma total importe ventas: ${totalImporteVentas.toFixed(3)}`;
}

// Función para validar el nombre de archivo ZIP según estructura esperada
function validarNombreDeArchivoZip(nombreArchivo) {
    const errores = [];
    const partes = nombreArchivo.split("_");

    if (!nombreArchivo.endsWith(".zip")) {
        errores.push("El archivo no es de tipo zip");
        return errores;
    }

    if (partes.length !== 8) {
        errores.push("El nombre del archivo no contiene 8 secciones separadas por '_'");
        return errores;
    }

    if (partes[0] !== "M" && partes[0] !== "D") errores.push("Identificador del tipo de documento inválido");
    if (partes[1].length !== 36) errores.push("Identificador de envío inválido");
    if (![12, 13].includes(partes[2].length)) errores.push("RFC del contribuyente inválido");
    if (![12, 13].includes(partes[3].length)) errores.push("RFC del proveedor inválido");

    const fecha = partes[4].split("-");
    if (!esFechaValida(fecha)) errores.push("Fecha inválida");

    if (!contarCaracteresAlfanumericos(partes[5])) errores.push("Clave de instalación inválida");
    if (!contarCaracteresClaves(partes[6])) errores.push("Clave tipo de reporte inválida");
    if (partes[7] !== "JSON.zip") errores.push("El nombre del archivo no termina correctamente en JSON.zip");

    return errores;
}

// Verifica que la fecha sea válida según año, mes, día y año bisiesto
function esFechaValida(fecha) {
    if (fecha.length !== 3) return false;
    const anio = parseInt(fecha[0], 10);
    const mes = parseInt(fecha[1], 10);
    const dia = parseInt(fecha[2], 10);
    if (isNaN(anio) || isNaN(mes) || isNaN(dia) || anio < 0 || mes < 1 || mes > 12) return false;

    const diasPorMes = [31, (anio % 4 === 0 && (anio % 100 !== 0 || anio % 400 === 0)) ? 29 : 28,
                        31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return dia >= 1 && dia <= diasPorMes[mes - 1];
}

// Verifica que la clave de instalación tenga 3 letras y 4 números
function contarCaracteresAlfanumericos(cadena) {
    const letras = cadena.match(/[a-zA-Z]/g) || [];
    const numeros = cadena.match(/\d/g) || [];
    return letras.length === 3 && numeros.length === 4;
}

// Verifica que la clave de tipo de reporte tenga solo 3 letras
function contarCaracteresClaves(cadena) {
    const letras = cadena.match(/[a-zA-Z]/g) || [];
    return letras.length === 3;
}

// Función para leer el contenido de un archivo ZIP, extraer JSON y acumular valores
async function leerArchivoZIP(archivo) {
    const reader = new FileReader();
    const result = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(archivo);
    });

    // Cargar el archivo ZIP con JSZip
    const zip = await JSZip.loadAsync(result);
    const jsonFileName = Object.keys(zip.files).find(name => name.endsWith('.json'));
    if (!jsonFileName) throw new Error("No se encontró archivo JSON dentro del ZIP");

    // Leer el archivo JSON y convertirlo a objeto
    const jsonData = await zip.file(jsonFileName).async("text");
    const data = JSON.parse(jsonData);

    // Calcular suma de volumen de compras
    let compras = data.Producto.reduce((sum, producto) =>
        sum + producto.Tanque.reduce((s, t) =>
            s + (t.Recepciones?.SumaVolumenRecepcion?.ValorNumerico || 0), 0), 0);
    totalVolumenCompras += parseFloat(compras.toFixed(3));

    // Calcular suma de volumen de ventas
    let ventas = data.Producto.reduce((sum, producto) =>
        sum + producto.Dispensario.reduce((s1, d) =>
            s1 + d.Manguera.reduce((s2, m) =>
                s2 + (m.Entregas?.[0]?.SumaVolumenEntregado?.ValorNumerico || 0), 0), 0), 0);
    totalVolumenVentas += parseFloat(ventas.toFixed(3));

    // Calcular suma del importe de ventas
    let importe = data.Producto.reduce((s, producto) =>
        s + producto.Dispensario.reduce((s1, d) =>
            s1 + d.Manguera.reduce((s2, m) =>
                s2 + (m.Entregas?.reduce((s3, e) =>
                    s3 + (parseFloat(e.SumaVentas) || 0), 0) || 0), 0), 0), 0);
    totalImporteVentas += parseFloat(importe.toFixed(3));
}

// Reinicia la página
function actualizarPagina() {
    location.reload();
}



//variable para almacenar el archivo que se arrastra o se selecciona
let file;

//variable para manipular la etiqueta input para seleccionar un archivo
const adjuntarArchivo = document.getElementById('adjuntarArchivo');

// Manejar el evento change del input para cuando se seleccionan archivos
adjuntarArchivo.addEventListener('change', () => {
    file = adjuntarArchivo.files[0];  // Acceder al primer (y único) archivo seleccionado
    // console.log(file.name);

    // ---------------------------------
    validarNombreDeArchivoZip();
    // accederAlZipYLeerJson();
    // ---------------------------------

});

const dropAreaImpresion = document.getElementById('dropArea');
const adjuntarArchivoImpresion = document.getElementById('adjuntarArchivo');

erroresTitulo = document.getElementById("erroresTitulo");
listadoErorresNombreArchivo = document.getElementById('listadoErorresNombreArchivo');

const fechaDelArchivo = document.getElementById('fechaDelArchivo');

const sumaVolumenCompras = document.getElementById('sumaVolumenCompras');
const sumaVolumenVentas = document.getElementById('sumaVolumenVentas');
const sumaImporteVentas = document.getElementById('sumaImporteVentas');

// const volumenCompras = document.getElementById('volumenCompras');
// const volumenComprasMagnaImpresion = document.getElementById('volumenComprasMagna');
// const volumenVentasDieselImpresion = document.getElementById('volumenVentasDiesel');
// const importeVentasDieselImpresion = document.getElementById('importeVentasDiesel');

// const magnaTitulo = document.getElementById('magnaTitulo');
// const volumenComprasMagnaImpresion = document.getElementById('volumenComprasMagna');
// const volumenVentasMagnaImpresion = document.getElementById('volumenVentasMagna');
// const importeVentasMagnaImpresion = document.getElementById('importeVentasMagna');

// const premiumTitulo = document.getElementById('premiumTitulo');
// const volumenComprasPremiumImpresion = document.getElementById('volumenComprasPremium');
// const volumenVentasPremiumImpresion = document.getElementById('volumenVentasPremium');
// const importeVentasPremiumImpresion = document.getElementById('importeVentasPremium');

// const rfcContribuyenteImpresion = document.getElementById('rfcContribuyente');
// const rfcProveedorImpresion = document.getElementById('rfcProveedor');

const nombreArchivoImpreso = document.getElementById("nombreArchivoImpreso");

const botonLimpiar = document.getElementById("botonLimpiar");

//variables globales para javascript arreglos
var arrayDeCadenas = [];
var arrayFechaCadenas = [];
var arrayErroresNombreArchivo = [];
//Arreglo RFC contribuyentes
// var arrayRFC_contribuyente = ['SEM1410318Q5','SEC150112537','SES150112RC3','SEM1512187Y9','SEB151218B36','SEC141031S67','SEC20082165A','JGE900406818',
//                                 'SEY0704139A8','CACX7605101P8','CGM130531NS2','CARJ521227GH5','SEC1503037FA','SEM141031V5A','SES150112RC3',
//                                 'AET1404031U2','SYU110901LR9','SEI1410319R7','SEC150204U97','SER150303GN5','SEM070413TA9','SEM150204RK4'];

// Metodos para controlar los eventos del area en donde se arrastra el zip
dropArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropArea.style.borderColor = '#005BB5';
});
dropArea.addEventListener('dragleave', () => {
    dropArea.style.borderColor = '#0087F7';
});

//metodo para capturar el archivo zip y realizar las operaciones pertinentes con el
dropArea.addEventListener('drop', (event) => {
    event.preventDefault();
    dropArea.style.borderColor = '#0087F7';
    file = event.dataTransfer.files[0];

    validarNombreDeArchivoZip();
    // accederAlZipYLeerJson();
});

//metodo para validar el nombre del archivo zip
function validarNombreDeArchivoZip()
{
    //Valida si el archivo no termina en .zip
    if (!file.name.endsWith('.zip')) 
        {
            //si no es un zip, manda una alerta y actualiza la página para reiniciar
            alert("El archivo no es de tipo zip");
            actualizarPagina();
        }

    // Captura del nombre del archivo zip en la variable nombreArchivo
    var nombreArchivo = file.name;
    var espacio = "_"; //separador del ciclo
    // metodo para dividir el nombre del archivo en un arreglo para despues analizarlo
    dividirCadena(nombreArchivo,espacio);   

    //Evaluaciones del nombre del archivo ----------------------------------------------------
    //Evaluar la primer letra del tipo del archivo
    if(arrayDeCadenas[0] !== "M" && arrayDeCadenas[0] !== "D")
    {
        arrayErroresNombreArchivo.push("Identificador del tipo de documento");
    }

    //Evalua el ID de envio sea de 36 caracteres
    if(arrayDeCadenas[1].length !== 36)
    {
        arrayErroresNombreArchivo.push("Identificador de envio");
    }

    //Evalua en RFC del contribuyente sea de 12 o 13 caracteres
    if(arrayDeCadenas[2].length !== 12 && arrayDeCadenas[2].length !== 13)
    {
        arrayErroresNombreArchivo.push("RFC del contribuyente");
    }

    //Evalua el RFC del proveedor sea de 12 o 13 caracteres
    if(arrayDeCadenas[3].length !== 12 && arrayDeCadenas[3].length !== 13)
    {
        arrayErroresNombreArchivo.push("RFC del proveedor");
    }

    var separador2 = "-";
    dividirCadenaFecha(arrayDeCadenas[4], separador2);

    //Llamada al metodo para evaluar la fecha
    if (!esFechaValida(arrayFechaCadenas))
    {
        arrayErroresNombreArchivo.push("Fecha invalida");
    }

    //Evalua clave de identificación de la instalación, debe ser de 8 caracteres
    if(!contarCaracteresAlfanumericos(arrayDeCadenas[5]))
    {
        arrayErroresNombreArchivo.push("Clave de instalacion");
    }
    
    //Evalua clave de tipo de reporte, debe ser de 3 caracteres y solo letras
    if(!contarCaracteresClaves(arrayDeCadenas[6]))
    {
        arrayErroresNombreArchivo.push("Clave de tipo de reporte");
    }

    //condicion que evalua que este bien escrito JSON y sea un zip
    if(arrayDeCadenas[7] !== "JSON.zip")
    {
        arrayErroresNombreArchivo.push("El nombre del archivo no termina en JSON.zip");
    }

//     console.log(arrayDeCadenas);
//     console.log(arrayErroresNombreArchivo);
    // ------------------------------------------------------------------------------------------

    //Si no hay errores se abre el zip y se lee el json
    if(arrayErroresNombreArchivo == 0)
    {
        accederAlZipYLeerJson();
    }
    //Si hay errores se muestran en pantalla y no se ejecuta
    else
    {
        var text = "";
        //Se recorre el arreglo de errores y se imprimen
        for (var i = 0; i < arrayErroresNombreArchivo.length; i++) {
        text += '<li>'+arrayErroresNombreArchivo[i]+'</li>';
        }
        document.getElementById("listadoErorresNombreArchivo").innerHTML = text;
        
        //Ocultar elementos en pantalla
        document.getElementById("dropArea").style.display = "none";
        adjuntarArchivoImpresion.classList.add("oculto");
        botonLimpiar.classList.remove("oculto");

        //Mostrar elementos en pantalla
        erroresTitulo.classList.remove("oculto");
        listadoErorresNombreArchivo.classList.remove("oculto");
    }
}

//Funcion para abrir zip y leer json
function accederAlZipYLeerJson()
{
    if (file && file.name.endsWith('.zip')) 
        {
            const reader = new FileReader();

            reader.onload = async (e) => 
            {
                try 
                {
                    //la libreria JSZip accede al zip
                    const zip = await JSZip.loadAsync(e.target.result);
                    //se busca el archivo json
                    const jsonFileName = Object.keys(zip.files).find(name => name.endsWith('.json'));

                    if (jsonFileName) 
                    {
                        //si se encuentra el archivo json se guarda en la variable data
                        const jsonData = await zip.file(jsonFileName).async("text");
                        const data = JSON.parse(jsonData);
                                   
                        // Ruta con iterador para sumar el total de volumen compras
                        let volumenCompras = data.Producto.reduce((sum, producto) => {
                            return sum + producto.Tanque.reduce((sumTanque, tanque) => {
                            return sumTanque + (tanque.Recepciones?.SumaVolumenRecepcion?.ValorNumerico || 0);
                            }, 0);
                        }, 0);
                        // Redondear a 3 decimales y convertir a número directamente sobre la misma variable
                        volumenCompras = parseFloat(volumenCompras.toFixed(3));
                        console.log("Volumen compras:", volumenCompras);
                        // console.log("Tipo de dato de volumenCompras:", typeof volumenCompras);
                        

                        // Ruta con iterador para sumar el total de volumen ventas
                        let volumenVentas = data.Producto.reduce((sum, producto) => {
                            return sum + producto.Dispensario.reduce((sumDispensario, dispensario) => {
                            return sumDispensario + dispensario.Manguera.reduce((sumManguera, manguera) => {
                                return sumManguera + (manguera.Entregas?.[0]?.SumaVolumenEntregado?.ValorNumerico || 0);
                            }, 0);
                            }, 0);
                        }, 0);
                        // Redondear a 3 decimales y convertir a número directamente sobre la misma variable
                        volumenVentas = parseFloat(volumenVentas.toFixed(3));
                        console.log("Volumen ventas:", volumenVentas);
                        // console.log("Tipo de dato de totalVolumenEntregado:", typeof totalVolumenEntregado);
  
                        // // Ruta con iterador para sumar el total de importe ventas
                        // let importeVentas = data.Producto.reduce((acumulador, producto) => {
                        //     // Iteramos sobre los dispensarios de cada producto
                        //     return acumulador + producto.Dispensario.reduce((acumuladorDispensario, dispensario) => {
                        //       // Iteramos sobre las mangueras de cada dispensario
                        //       return acumuladorDispensario + dispensario.Manguera.reduce((acumuladorManguera, manguera) => {
                        //         // Iteramos sobre las entregas de cada manguera
                        //         return acumuladorManguera + manguera.Entregas.reduce((acumuladorEntrega, entrega) => {
                        //           // Sumamos el valor de SumaVentas
                        //           return acumuladorEntrega + entrega.SumaVentas;
                        //         }, 0); // Valor inicial de 0 para cada entrega
                        //       }, 0); // Valor inicial de 0 para cada manguera
                        //     }, 0); // Valor inicial de 0 para cada dispensario
                        //   }, 0); // Valor inicial de 0 para cada producto
                        //   // Redondeamos a 3 decimales y convertimos a número
                        //   importeVentas = parseFloat(importeVentas.toFixed(3));
                        //   console.log("Importe ventas:", importeVentas);
                        // //   console.log("Tipo de dato de importeVentas:", typeof importeVentas);

                        // // Ruta con iterador para sumar el total de importe ventas
                        // let importeVentas = data.Producto.reduce((acumulador, producto) => {
                        //      // Iteramos sobre los dispensarios de cada producto
                        //     return acumulador + producto.Dispensario.reduce((acumuladorDispensario, dispensario) => {
                        //         // Iteramos sobre las mangueras de cada dispensario
                        //         return acumuladorDispensario + dispensario.Manguera.reduce((acumuladorManguera, manguera) => {
                        //             // Iteramos sobre las entregas de cada manguera
                        //             return acumuladorManguera + manguera.Entregas.reduce((acumuladorEntrega, entrega) => {
                        //                 // Sumamos el valor de SumaVentas
                        //                 let sumaVentas = parseFloat(entrega.SumaVentas) || 0; // Convierte a número y evita NaN
                        //                 return acumuladorEntrega + sumaVentas;
                        //             }, 0); // Valor inicial de 0 para cada entrega
                        //         }, 0); // Valor inicial de 0 para cada manguera
                        //     }, 0); // Valor inicial de 0 para cada dispensario
                        // }, 0); // Valor inicial de 0 para cada producto

                        let importeVentas = data.Producto.reduce((acumulador, producto) => {
                            // Iteramos sobre los dispensarios de cada producto
                            return acumulador + producto.Dispensario.reduce((acumuladorDispensario, dispensario) => {
                                // Iteramos sobre las mangueras de cada dispensario
                                return acumuladorDispensario + dispensario.Manguera.reduce((acumuladorManguera, manguera) => {
                                    // Iteramos sobre las entregas de cada manguera
                                    //Si entregas no existe, no hace el reduce, simplemente pasa el valor como 0
                                    return acumuladorManguera + (manguera.Entregas ? manguera.Entregas.reduce((acumuladorEntrega, entrega) => {
                                        // Verificar si "SumaVentas" existe y si es un valor numérico
                                        let sumaVentas = parseFloat(entrega.SumaVentas) || 0; // Si no es válido, será 0
                                        return acumuladorEntrega + sumaVentas;
                                    }, 0) : 0); // Si "Entregas" no existe, sumar 0
                                }, 0); // Valor inicial de 0 para cada manguera
                            }, 0); // Valor inicial de 0 para cada dispensario
                        }, 0); // Valor inicial de 0 para cada producto
                        

                        // Redondear a 3 decimales y convertir a número
                        importeVentas = parseFloat(importeVentas.toFixed(3));

                        console.log("Importe ventas:", importeVentas);

                        // cantidades individuales DIESEL
                        // const volumenComprasMagna = data.Producto.find(producto => producto.MarcaComercial.toUpperCase() === "MAGNA")?.Tanque[0]?.Recepciones?.SumaVolumenRecepcion?.ValorNumerico;
                        // const volumenVentasDiesel = data.Producto.find(producto => producto.MarcaComercial.toUpperCase() === "DIESEL")?.ReporteDeVolumenMensual.Entregas.SumaVolumenEntregado.ValorNumerico;
                        // const importeVentasDiesel = data.Producto.find(producto => producto.MarcaComercial.toUpperCase() === "DIESEL")?.ReporteDeVolumenMensual.Entregas.ImporteTotalEntregasMes;
                        
                        // cantidades individuales MAGNA
                        // const volumenComprasMagna = data.Producto.find(producto => producto.MarcaComercial.toUpperCase() === "MAGNA")?.Tanque[0]?.Recepciones?.SumaVolumenRecepcion?.ValorNumerico;
                        // const volumenVentasMagna = data.Producto.find(producto => producto.MarcaComercial.toUpperCase() === "MAGNA")?.ReporteDeVolumenMensual.Entregas.SumaVolumenEntregadoMes.ValorNumerico;
                        // const importeVentasMagna = data.Producto.find(producto => producto.MarcaComercial.toUpperCase() === "MAGNA")?.ReporteDeVolumenMensual.Entregas.ImporteTotalEntregasMes;

                        // cantidades individuales PREMIUM
                        // const volumenComprasPremium = data.Producto.find(producto => producto.MarcaComercial.toUpperCase() === "PREMIUM")?.Tanque[0]?.Recepciones?.SumaVolumenRecepcion?.ValorNumerico;
                        // const volumenVentasPremium = data.Producto.find(producto => producto.MarcaComercial.toUpperCase() === "PREMIUM")?.ReporteDeVolumenMensual.Entregas.SumaVolumenEntregadoMes.ValorNumerico;
                        // const importeVentasPremium = data.Producto.find(producto => producto.MarcaComercial.toUpperCase() === "PREMIUM")?.ReporteDeVolumenMensual.Entregas.ImporteTotalEntregasMes;
                        

                        //RFC contribuyente del json
                        // const rfcContribuyente = data.RfcContribuyente;

                        //RFC proveedor json
                        // const rfcProveedor = data.RfcProveedor;
                        // console.log(rfcProveedor);

                        // //Convertir fecha a una más legible
                        // fechaDelArchivoJson = arrayDeCadenas[4];
                        // console.log(arrayDeCadenas[4]);
                        // fechaDelArchivoJson = new Date(fechaDelArchivoJson);
                        // // Opciones para el formato deseado, sin el día de la semana
                        // const opciones = {
                        //     year: 'numeric',   // año completo
                        //     month: 'long',     // mes en palabra, por ejemplo: enero, octubre
                        //     day: 'numeric'     // día del mes
                        // };
                        // // Usamos toLocaleDateString para formatear la fecha
                        // fechaDelArchivoJson = fechaDelArchivoJson.toLocaleDateString('es-ES', opciones);

                        // Obtener la fecha en formato 'YYYY-MM-DD' desde arrayDeCadenas
                        let fechaDelArchivoJson = arrayDeCadenas[4];
                        console.log("Fecha original:", fechaDelArchivoJson);
                        // Separar año, mes y día manualmente
                        const [year, month, day] = fechaDelArchivoJson.split('-').map(Number); // Convertir a números
                        // Crear la fecha como cadena ISO para evitar problemas de zona horaria
                        const fechaCorregida = new Date(Date.UTC(year, month - 1, day));
                        // Opciones de formato en español
                        const opciones = {
                            year: 'numeric',
                            month: 'long'
                        };
                        // Convertir la fecha a formato legible
                        let fechaFormateada = fechaCorregida.toLocaleDateString('es-ES', opciones);
                        // Agregar el día manualmente al texto
                        fechaFormateada = `${day} de ${fechaFormateada}`;
                        console.log("Fecha formateada:", fechaFormateada); // Ejemplo: "2 de octubre de 2023"

                        //Se imprimen en la pagina web los resultados
                        fechaDelArchivo.textContent = `La fecha del archivo es: ${fechaFormateada}`;
                        sumaVolumenCompras.textContent = `La suma de volumen compras es: ${volumenCompras}`;
                        sumaVolumenVentas.textContent = `La suma de volumen ventas es: ${volumenVentas}`;
                        sumaImporteVentas.textContent = `La suma de importe ventas es: ${importeVentas}`;
                        
                        // volumenComprasDieselImpresion.textContent = `El volumen compras es: ${volumenComprasDiesel}`;

                        // console.log(volumenComprasMagna);
                        // console.log(volumenComprasPremium);

                        // volumenVentasDieselImpresion.textContent = `El volumen ventas es: ${volumenVentasDiesel}`;
                        // importeVentasDieselImpresion.textContent = `El importe ventas es: ${importeVentasDiesel}`;

                        // volumenComprasMagnaImpresion.textContent = `El volumen compras es: ${volumenComprasMagna}`;
                        // volumenVentasMagnaImpresion.textContent = `El volumen ventas es: ${volumenVentasMagna}`;
                        // importeVentasMagnaImpresion.textContent = `El importe ventas es: ${importeVentasMagna}`;

                        // volumenComprasPremiumImpresion.textContent = `El volumen compras es: ${volumenComprasPremium}`;
                        // volumenVentasPremiumImpresion.textContent = `El volumen ventas es: ${volumenVentasPremium}`;
                        // importeVentasPremiumImpresion.textContent = `El importe ventas es: ${importeVentasPremium}`;

                        // rfcContribuyenteImpresion.textContent = `El RFC del contribuyente es: ${rfcContribuyente}`;
                        // rfcProveedorImpresion.textContent = `El RFC del proveedor es: ${rfcProveedor}`;
                        
                        nombreArchivoImpreso.textContent = `El nombre del archivo es: ${file.name}`;

                        // errorDisplay.textContent = ""; 

                        //Ocultar elementos en pantalla
                        document.getElementById("dropArea").style.display = "none";
                        adjuntarArchivoImpresion.classList.add("oculto");

                        //Mostrar elementos en pantalla
                        fechaDelArchivo.classList.remove("oculto");

                        sumaVolumenCompras.classList.remove("oculto");
                        sumaVolumenVentas.classList.remove("oculto");
                        sumaImporteVentas.classList.remove("oculto");
                        
                        // dieselTitulo.classList.remove("oculto");
                        // volumenComprasDieselImpresion.classList.remove('oculto');
                        // volumenVentasDieselImpresion.classList.remove('oculto');
                        // importeVentasDieselImpresion.classList.remove('oculto');

                        // magnaTitulo.classList.remove("oculto");
                        // volumenComprasMagnaImpresion.classList.remove('oculto');
                        // volumenVentasMagnaImpresion.classList.remove('oculto');
                        // importeVentasMagnaImpresion.classList.remove('oculto');

                        // premiumTitulo.classList.remove("oculto");
                        // volumenComprasPremiumImpresion.classList.remove('oculto');
                        // volumenVentasPremiumImpresion.classList.remove('oculto');
                        // importeVentasPremiumImpresion.classList.remove('oculto');
                        
                        // rfcContribuyenteImpresion.classList.remove("oculto");
                        // rfcProveedorImpresion.classList.remove("oculto");
                        nombreArchivoImpreso.classList.remove("oculto");

                        botonLimpiar.classList.remove("oculto");
                    } 
                    else 
                    {
                        //Error no se encontro el archivo json en el zip
                       alert("No se encontró un archivo JSON en el ZIP.");
                       actualizarPagina();
                    }
                } 
                catch (error) 
                {
                    //Error al procesar un archivo zip
                    alert("Error al procesar el archivo ZIP o JSON.");
                    actualizarPagina();
                }
            };
            reader.readAsArrayBuffer(file);
        } 
        else 
        {
            //Error por si no se sube un archivo zip
           alert("Por favor, sube un archivo ZIP válido.");
           actualizarPagina();
        }//Termino de condicion
}

//metodo para recargar una pagina web
function actualizarPagina()
{
    location.reload();
}

//Funcion para dividir la cadena de la fecha en un arreglo que separa el año, el mes y el dia
function dividirCadenaFecha(cadenaDividir2, separador2)
{
    arrayFechaCadenas = cadenaDividir2.split(separador2);
}

//metodo para validar que la fecha del documento sea valida
//evalua que un mes o dia esten fuera de rango, dia invalido, año negativo, formato incorrecto, valores no numericos
function esFechaValida(fecha) 
{
    //verifica que el arreglo tenga 3 elementos
    if (fecha.length !== 3) {
        return false;
    }

//     //convierte en entero las variables
    const anio = parseInt(fecha[0], 10);
    const mes = parseInt(fecha[1], 10);
    const dia = parseInt(fecha[2], 10);

//     // Validar año, mes y día, que no sean nulos o cero
    if (isNaN(anio) || isNaN(mes) || isNaN(dia) || anio < 0 || mes < 1 || mes > 12) {
        return false;
    }

//     // Evalua días máximos por mes
    const diasPorMes = [31, (anio % 4 === 0 && (anio % 100 !== 0 || anio % 400 === 0)) ? 29 : 28,
                        31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    return dia >= 1 && dia <= diasPorMes[mes - 1];
}

// //Metodo para dividir el nombre del archivo en cadenas en un arreglo, lo separa en id, idenvio, rfccontribuyente
// //rfcproveedor, fechaperiodo, claveinstalacion, tipodereporte y estandar
function dividirCadena(cadenaDividir, separador)
{
    // variable global, divide la cadena en un array a partir del separador _
    arrayDeCadenas = cadenaDividir.split(separador);
}

function contarCaracteresAlfanumericos(cadena) 
{
    // Utilizamos una expresión regular para encontrar solo letras
    const letras = cadena.match(/[a-zA-Z]/g);
    // Si no hay letras, devolvemos 0, de lo contrario, devolvemos la longitud del array
    //return letras ? letras.length : 0;
    const numeros = cadena.match(/\d/g);
    if(letras.length == 3 && numeros.length == 4){
        return letras && numeros;
    }
    else{
        return false;
    }
}

function contarCaracteresClaves(cadena) 
{
    // Utilizamos una expresión regular para encontrar solo letras
    const letras = cadena.match(/[a-zA-Z]/g);
    // Si no hay letras, devolvemos 0, de lo contrario, devolvemos la longitud del array
    //return letras ? letras.length : 0;
    if(letras.length == 3)
    {
        return letras;
    }
    else
    {
        return false;
    }
}
//Carlos Merino Crespo
let cuadro, tablero, mario, huella, contadorFila = 10, randomEne, randomSeta, pos = 180, foto, seta, estrella, bandera, rutaGoomba, rutaSeta, rutaBandera, rutaEstrella,
    header, puntuacion, puntos, vidas, corazones, corazon, salida, velocidad = 400, primeraVez = true, contadorVidas = 3, final = false, poderEstrella = false,
    contEnemigos = 0, enemigo, puntosSeta = 100;
//Expresiones regulares para los cuadros que son cajas
let regExp1 = /^(22|23|24|26|27|28|30|31|32|34|35|36|38|39|40|43|44|45|47|48|49|51|52|53|55|56|57|59|60|61)$/;
let regExp2 = /^(85|86|87|89|90|91|93|94|95|97|98|99|101|102|103|106|107|108|110|111|112|114|115|116|118|119|120|122|123|124)$/;
let regExp3 = /^(148|149|150|152|153|154|156|157|158|160|161|162|164|165|166|169|170|171|173|174|175|177|178|179|181|182|183|185|186|187)$/;
let regExp4 = /^(211|212|213|215|216|217|219|220|221|223|224|225|227|228|229|232|233|234|236|237|238|240|241|242|244|245|246|248|249|250)$/;
//Expresiones regulares para los cuadros que son pared lateral
let regExpParedDer = /^(20|41|62|83|104|125|146|167|188|209|230|251)$/;
let regExpParedIzq = /^(21|42|63|84|105|126|147|168|189|210|231|252)$/;

let cuadrosArray = Array();
let posibilidades = Array();
let enemigos = Array();
let intervalo;
window.onload = () => {
    //Recojo el div con id tablero
    tablero = document.getElementById("tablero");
    //Creo el header para los puntos
    header = document.createElement("div");
    header.id = "header";
    puntuacion = document.createElement("div");
    puntuacion.id = "puntuacion";
    puntuacion.innerText = "PUNTOS";
    puntos = document.createElement("div");
    puntos.id = "puntos";
    puntuacion.appendChild(puntos);
    //Si es la primera fase la velocidad, vidas y los puntos por setas serán los iniciales
    if (primeraVez) {
        localStorage.setItem("velocidad", velocidad);
        localStorage.setItem("vidas", contadorVidas);
        localStorage.setItem("puntosSeta", puntosSeta);
        puntos.innerText = 0;
    } else {
        //Cada nueva fase la velocidad de los enemigos aumenta
        localStorage.setItem("velocidad", localStorage.getItem("velocidad") - 100);
        //Cada nueva fase los puntos que dan las setas aumentan exponencialmente
        localStorage.setItem("puntosSeta", parseInt(localStorage.getItem("puntosSeta")) + parseInt(localStorage.getItem("puntosSeta")));
        puntos.innerText = localStorage.getItem("puntos");
    }
    //Creo las vidas en el header
    vidas = document.createElement("div");
    vidas.id = "vidas";
    vidas.innerText = "VIDAS";
    corazones = document.createElement("div");
    corazones.id = "corazones";
    //Coloco las vidas que tienes
    for (let i = 0; i < localStorage.getItem("vidas"); i++) {
        corazon = document.createElement("img");
        corazon.classList.add("corazon");
        corazon.src = "img/mario.png";
        corazones.appendChild(corazon);
    }
    //Coloco header en el tablero, los puntos y las vidas
    puntuacion.appendChild(puntos);
    tablero.appendChild(header);
    header.appendChild(puntuacion);
    header.appendChild(vidas);
    vidas.appendChild(corazones);
    //Creo el div de la salida para pasar a la siguiente fase
    salida = document.createElement("div");
    salida.classList.add("salida");
    salida.classList.add("ocultar");
    tablero.appendChild(salida);
    //Creo el tablero. Hay 21 cuadros por fila, añado las clases pertinentes a determinados cuadros
    for (let i = 0; i < 273; i++) {
        cuadro = document.createElement("div");
        cuadro.classList.add("cuadro");
        //Paredes laterales
        if (regExpParedDer.test(i)) {
            cuadro.classList.add("paredDer");
        } else if (regExpParedIzq.test(i)) {
            cuadro.classList.add("paredIzq");
        }
        //Paredes superior e inferior
        if (i >= 0 && i <= 20) {
            cuadro.classList.add("paredSup");
        } else if (i >= 252 && i <= 272) {
            cuadro.classList.add("paredInf");
        }
        //Añado los cuadros al tablero
        tablero.appendChild(cuadro);
        //Determino los cuadros que son cajas y contienen imagenes y los que son camino
        if (regExp1.test(i) || regExp2.test(i) || regExp3.test(i) || regExp4.test(i)) {
            cuadro.classList.add("caja");
        } else {
            cuadro.classList.add("camino");
        }
    }
    //Creo a Mario y lo situo arriba en el centro
    mario = document.createElement("img");
    mario.src = "img/mario.png";
    cuadrosArray = document.getElementsByClassName("cuadro");
    cuadrosArray[10].appendChild(mario);
    //Le doy la clase huella para pintar el fondo con una moneda por donde pasa
    cuadrosArray[10].classList.add("huella");
    //Le doy la clase mario al cuadrado en el que está. Cuando se mueva se eliminará la clase de ese cuadrado
    cuadrosArray[10].classList.add("mario");
    //Evento de teclado para mover a Mario
    document.addEventListener("keydown", mover);
    //Reinicio el array enemigos para cada fase
    enemigos = [];
    //Quito el poder estrella si ha pasado de fase con el activo
    poderEstrella = false;
    //Llamo a crear enemigo y colocar imagenes
    crearEnemigo();
    colocarImagenes();
    //Intervalo para mover los enemigos, la velocidad será determinada por la fase en la que se encuentre el jugador, de más lenta a más rápida
    intervalo = setInterval(movEnemigo, localStorage.getItem("velocidad"));
}
//Función para colocar todas las imagenes, en total 15
function colocarImagenes() {
    for (let i = 0; i < 15; i++) {
        //Random que sacará un número del 1 al 20 para utilizar en el switch más abajo
        randomSeta = Math.floor(Math.random() * 20) + 1;
        //Creo las imagenes a utilizar
        foto = document.createElement("img");
        //Coloco 10 setas
        if (i < 10) {
            foto.src = "img/seta.png";
            //Guardo en las variables "rutaX" la ruta absoluta de la imagen
            rutaSeta = foto.src;
            foto.classList.add("foto");
            //Les añado la clase ocultar para que no se muestren
            foto.classList.add("ocultar");
        }
        //Coloco 3 enemigos
        if (i >= 10 && i < 13) {
            foto.src = "img/goomba.png";
            rutaGoomba = foto.src;
            foto.classList.add("foto");
            foto.classList.add("ocultar");
        }
        //Coloco una bandera para la salida
        if (i == 13) {
            foto.src = "img/bandera.png";
            rutaBandera = foto.src;
            foto.classList.add("foto");
            foto.classList.add("ocultar");
        }
        //Coloco una estrella para comerte un enemigo
        if (i == 14) {
            foto.src = "img/estrella.png";
            rutaEstrella = foto.src;
            foto.classList.add("foto");
            foto.classList.add("ocultar");
        }
        //Según el número random colocará la imagen en un determinado cuadrado
        switch (randomSeta) {
            case 1:
                //Si no contiene hijo (imagen), coloca la foto
                if (!cuadrosArray[22].hasChildNodes()) {
                    cuadrosArray[22].appendChild(foto);
                    break;
                //Si contiene imagen, restará i y saldrá del bucle para probar en otro cuadro
                } else {
                    i--;
                    break
                }
            case 2:
                if (!cuadrosArray[26].hasChildNodes()) {
                    cuadrosArray[26].appendChild(foto);
                    break;
                } else {
                    i--;
                    break;
                }
            case 3:
                if (!cuadrosArray[30].hasChildNodes()) {
                    cuadrosArray[30].appendChild(foto);
                    break;
                } else {
                    i--;
                    break;
                }
            case 4:
                if (!cuadrosArray[34].hasChildNodes()) {
                    cuadrosArray[34].appendChild(foto);
                    break;
                } else {
                    i--;
                    break;
                }
            case 5:
                if (!cuadrosArray[38].hasChildNodes()) {
                    cuadrosArray[38].appendChild(foto);
                    break;
                } else {
                    i--;
                    break;
                }
            case 6:
                if (!cuadrosArray[85].hasChildNodes()) {
                    cuadrosArray[85].appendChild(foto);
                    break;
                } else {
                    i--;
                    break;
                }
            case 7:
                if (!cuadrosArray[89].hasChildNodes()) {
                    cuadrosArray[89].appendChild(foto);
                    break;
                } else {
                    i--;
                    break;
                }
            case 8:
                if (!cuadrosArray[93].hasChildNodes()) {
                    cuadrosArray[93].appendChild(foto);
                    break;
                } else {
                    i--;
                    break;
                }
            case 9:
                if (!cuadrosArray[97].hasChildNodes()) {
                    cuadrosArray[97].appendChild(foto);
                    break;
                } else {
                    i--;
                    break;
                }
            case 10:
                if (!cuadrosArray[101].hasChildNodes()) {
                    cuadrosArray[101].appendChild(foto);
                    break;
                } else {
                    i--;
                    break;
                }
            case 11:
                if (!cuadrosArray[148].hasChildNodes()) {
                    cuadrosArray[148].appendChild(foto);
                    break;
                } else {
                    i--;
                    break;
                }
            case 12:
                if (!cuadrosArray[152].hasChildNodes()) {
                    cuadrosArray[152].appendChild(foto);
                    break;
                } else {
                    i--;
                    break;
                }
            case 13:
                if (!cuadrosArray[156].hasChildNodes()) {
                    cuadrosArray[156].appendChild(foto);
                    break;
                } else {
                    i--;
                    break;
                }
            case 14:
                if (!cuadrosArray[160].hasChildNodes()) {
                    cuadrosArray[160].appendChild(foto);
                    break;
                } else {
                    i--;
                    break;
                }
            case 15:
                if (!cuadrosArray[164].hasChildNodes()) {
                    cuadrosArray[164].appendChild(foto);
                    break;
                } else {
                    i--;
                    break;
                }
            case 16:
                if (!cuadrosArray[211].hasChildNodes()) {
                    cuadrosArray[211].appendChild(foto);
                    break;
                } else {
                    i--;
                    break;
                }
            case 17:
                if (!cuadrosArray[215].hasChildNodes()) {
                    cuadrosArray[215].appendChild(foto);
                    break;
                } else {
                    i--;
                    break;
                }
            case 18:
                if (!cuadrosArray[219].hasChildNodes()) {
                    cuadrosArray[219].appendChild(foto);
                    break;
                } else {
                    i--;
                    break;
                }
            case 19:
                if (!cuadrosArray[223].hasChildNodes()) {
                    cuadrosArray[223].appendChild(foto);
                    break;
                } else {
                    i--;
                    break;
                }
            case 20:
                if (!cuadrosArray[227].hasChildNodes()) {
                    cuadrosArray[227].appendChild(foto);
                    break;
                } else {
                    i--;
                    break;
                }
        }
    }
}
//Función para mover a Mario
function mover(event) {
    //Si no ha terminado la partida, entra
    if (!final) {
        //Guardamos en tecla la tecla que hemos pulsado
        let tecla = event.key;
        //Expresión regular para controlar que solo haga algo cuando pulsamos esas teclas
        let exp = /Arrow[Right|Left|Up|Down]/;
        if (exp.test(tecla)) {
            //Si pulsa arriba, hemos descubierto la salida y estamos en el cuadro de debajo de la salida, llamará a la funcion siguienteNivel para pasar de fase
            if (tecla == "ArrowUp" && !salida.classList.contains("ocultar") && contadorFila == 10) {
                salida.appendChild(mario);
                //LLAMA A REINICIAR PARTIDA
                setTimeout(siguienteNivel,400);
            }
            //Condiciones que comprueban si donde nos queremos mover no son cajas y son caminos, esta es para mover a Mario a la derecha
            if (tecla == "ArrowRight" && !cuadrosArray[contadorFila + 1].classList.contains("caja") && !cuadrosArray[contadorFila].classList.contains("paredDer")) {
                //Colocamos a mario en la dirección pulsada si es camino
                cuadrosArray[contadorFila + 1].appendChild(mario);
                //Añadimos la clase huella para marcar el fondo
                cuadrosArray[contadorFila + 1].classList.add("huella");
                //Eliminamos la clase mario del cuadro en el que estaba
                cuadrosArray[contadorFila].classList.remove("mario");
                //Añadimos la clase mario al cuadro al que le hemos movido
                cuadrosArray[contadorFila + 1].classList.add("mario");
                //Si ha encontrado la estrella, haremos lo mismo con la clase estrella que con la clase mario
                if (poderEstrella) {
                    cuadrosArray[contadorFila].classList.remove("estrella");
                    cuadrosArray[contadorFila + 1].classList.add("estrella");
                }
                //Actualizo contadorFila con la posición actual de Mario en el tablero (array)
                contadorFila++;
            }
            //El resto de condiciones funcionan igual, esta es para mover a Mario a la izquierda
            if (tecla == "ArrowLeft" && !cuadrosArray[contadorFila - 1].classList.contains("caja") && !cuadrosArray[contadorFila].classList.contains("paredIzq")) {
                cuadrosArray[contadorFila - 1].appendChild(mario);
                cuadrosArray[contadorFila - 1].classList.add("huella");
                cuadrosArray[contadorFila].classList.remove("mario");
                cuadrosArray[contadorFila - 1].classList.add("mario");
                if (poderEstrella) {
                    cuadrosArray[contadorFila].classList.remove("estrella");
                    cuadrosArray[contadorFila - 1].classList.add("estrella");
                }
                contadorFila--;
            }
            //Mover a Mario arriba
            if (tecla == "ArrowUp" && !cuadrosArray[contadorFila - 21].classList.contains("caja")) {
                cuadrosArray[contadorFila - 21].appendChild(mario);
                cuadrosArray[contadorFila - 21].classList.add("huella");
                cuadrosArray[contadorFila].classList.remove("mario");
                cuadrosArray[contadorFila - 21].classList.add("mario");
                if (poderEstrella) {
                    cuadrosArray[contadorFila].classList.remove("estrella");
                    cuadrosArray[contadorFila - 21].classList.add("estrella");
                }
                contadorFila = contadorFila - 21;
            }
            //Mover a Mario abajo
            if (tecla == "ArrowDown" && !cuadrosArray[contadorFila + 21].classList.contains("caja")) {
                cuadrosArray[contadorFila + 21].appendChild(mario);
                cuadrosArray[contadorFila + 21].classList.add("huella");
                cuadrosArray[contadorFila].classList.remove("mario");
                cuadrosArray[contadorFila + 21].classList.add("mario");
                if (poderEstrella) {
                    cuadrosArray[contadorFila].classList.remove("estrella");
                    cuadrosArray[contadorFila + 21].classList.add("estrella");
                }
                contadorFila = contadorFila + 21;
            }
        }
        //Llamo a comprobarMuerte pasando la posición de Mario y a comprobarCajas con cada movimiento
        comprobarMuerte(contadorFila);
        comprobarCajas();
    }
}
//Función que crea un enemigo
function crearEnemigo() {
    enemigo = document.createElement("img");
    enemigo.src = "img/goomba.png";
    enemigo.classList.add("enemigo");
    enemigos.push(enemigo);
    contEnemigos++;
    let encontrado;
    //Bucle anidado para poner un id distinto a cada enemigo y evitar que introduzca el mismo id a un nuevo enemigo que el id que tenía uno eliminado
    for (let i = 0; i < contEnemigos; i++) {
        encontrado = false;
        for (let x = 0; x < enemigos.length; x++) {
            if (enemigos[x].id == i) {
                encontrado = true;
            }
        }
        //Si el id no coincide con ninguno de los enemigos introduzco el id
        if (!encontrado) {
            enemigo.id = i;
            break;
        }
    }
    //Si coincide, el id será el número de enemigos
    if (encontrado) {
        enemigo.id = contEnemigos;
    }
    //Doy el atributo posición al enemigo guardando en el la posición en el array para moverlo a partir de ahi
    //Pos a partir del segundo enemigo será la posición del array debajo de la imagen del goomba encontrado
    enemigo.dataset.posicion = pos;
    //Coloco el último enemigo creado en esa posición
    cuadrosArray[enemigo.dataset.posicion].appendChild(enemigos[enemigos.length - 1]);
}
//Función para mover enemigos
function movEnemigo() {
    //Con un forEach recorro cada enemigo para moverlo
    enemigos.forEach(ene => {
        //En este array introduzco los movimientos posibles que puede realizar el enemigo para despues con un random decidir a donde se mueve
        posibilidades = Array();
        //Condiciones para el movimiento del enemigo. Este es para moverse a la derecha
        //Si está en un cuadro camino
        if (cuadrosArray[parseInt(ene.dataset.posicion)].classList.contains("camino")) {
            //Si no está en la pared derecha ni tiene una caja a la derecha
            if (!cuadrosArray[parseInt(ene.dataset.posicion)].classList.contains("paredDer") && !cuadrosArray[parseInt(ene.dataset.posicion) + 1].classList.contains("caja")) {
                //Si la posición a la que va es menor de la longitud máxima del array, entra y guarda en posibilidades un número para con un random seleccionar más tarde
                if (parseInt(ene.dataset.posicion) + 1 < 272) {
                    posibilidades.push(2);
                }
            }
        }
        //El resto de condiciones funcionan igual, dependiendo de la posición a donde quiere moverse. Este es para la izquierda
        if (cuadrosArray[parseInt(ene.dataset.posicion)].classList.contains("camino")) {
            if (!cuadrosArray[parseInt(ene.dataset.posicion)].classList.contains("paredIzq") && !cuadrosArray[parseInt(ene.dataset.posicion) - 1].classList.contains("caja")) {
                if (parseInt(ene.dataset.posicion) - 1 > 0) {
                    posibilidades.push(3);
                }
            }
        }
        //Condición para moverse arriba
        if (cuadrosArray[parseInt(ene.dataset.posicion)].classList.contains("camino")) {
            if (!cuadrosArray[parseInt(ene.dataset.posicion)].classList.contains("paredSup") && !cuadrosArray[parseInt(ene.dataset.posicion) - 21].classList.contains("caja")) {
                if (parseInt(ene.dataset.posicion) - 21 > 0) {
                    posibilidades.push(0);
                }
            }
        }
        //Condición para moverse abajo
        if (cuadrosArray[parseInt(ene.dataset.posicion)].classList.contains("camino")) {
            if (!cuadrosArray[parseInt(ene.dataset.posicion)].classList.contains("paredInf") && !cuadrosArray[parseInt(ene.dataset.posicion) + 21].classList.contains("caja")) {
                if (parseInt(ene.dataset.posicion) + 21 < 272) {
                    posibilidades.push(1);
                }
            }
        }
        //Random de la longitud del array posibilidades, para seleccionar de forma aleatoria a donde se va a mover
        randomEne = Math.floor(Math.random() * posibilidades.length);
        switch (posibilidades[randomEne]) {
            case 2:
                //Muevo el enemigo
                cuadrosArray[parseInt(ene.dataset.posicion) + 1].appendChild(ene);
                //Elimino la clase goomba del cuadro en el que estaba
                cuadrosArray[parseInt(ene.dataset.posicion)].classList.remove("goomba");
                //Añado la clase goomba al cuadro que se mueve
                cuadrosArray[parseInt(ene.dataset.posicion) + 1].classList.add("goomba");
                //Actualizo la posición del enemigo
                ene.dataset.posicion++;
                break;
            //El resto de casos funcionan igual
            case 3:
                cuadrosArray[parseInt(ene.dataset.posicion) - 1].appendChild(ene);
                cuadrosArray[parseInt(ene.dataset.posicion)].classList.remove("goomba");
                cuadrosArray[parseInt(ene.dataset.posicion) - 1].classList.add("goomba");
                ene.dataset.posicion--
                break;
            case 0:
                cuadrosArray[parseInt(ene.dataset.posicion) - 21].appendChild(ene);
                cuadrosArray[parseInt(ene.dataset.posicion)].classList.remove("goomba");
                cuadrosArray[parseInt(ene.dataset.posicion) - 21].classList.add("goomba");
                ene.dataset.posicion = parseInt(ene.dataset.posicion) - 21;
                break;
            case 1:
                cuadrosArray[parseInt(ene.dataset.posicion) + 21].appendChild(ene);
                cuadrosArray[parseInt(ene.dataset.posicion)].classList.remove("goomba");
                cuadrosArray[parseInt(ene.dataset.posicion) + 21].classList.add("goomba");
                ene.dataset.posicion = parseInt(ene.dataset.posicion) + 21;
                break;
        }
        //Llamo a comprobarMuerte en cada movimiento enemigo
        comprobarMuerte(ene.dataset.posicion);
    });
}
//Función que comprueba las cajas con cada movimiento para descubrir lo que tienen
function comprobarCajas() {
    let imagen;
    //Recorro el tablero
    for (let i = 0; i < 272; i++) {
        //Si es una caja entra
        if (cuadrosArray[i].classList.contains("caja")) {
            //Comprueba si su alrededor a sido marcado
            if (cuadrosArray[i - 22].classList.contains("huella") && cuadrosArray[i - 21].classList.contains("huella") &&
                cuadrosArray[i - 20].classList.contains("huella") && cuadrosArray[i - 19].classList.contains("huella") &&
                cuadrosArray[i - 18].classList.contains("huella") && cuadrosArray[i - 1].classList.contains("huella") &&
                cuadrosArray[i + 3].classList.contains("huella") && cuadrosArray[i + 20].classList.contains("huella") &&
                cuadrosArray[i + 24].classList.contains("huella") &&
                cuadrosArray[i + 41].classList.contains("huella") && cuadrosArray[i + 42].classList.contains("huella") &&
                cuadrosArray[i + 43].classList.contains("huella") && cuadrosArray[i + 44].classList.contains("huella") &&
                cuadrosArray[i + 45].classList.contains("huella")) {
                //Guarda en imagen el primer hijo de la caja (la imagen que está oculta) o nada si no tiene imagen
                imagen = cuadrosArray[i].firstChild;
                //Si contiene una imagen, entra
                if (imagen) {
                    //Si la ruta de la imagen coincide con la ruta de alguna de las imagenes colocadas
                    if (imagen.src == rutaGoomba || imagen.src == rutaSeta || imagen.src == rutaBandera || imagen.src == rutaEstrella) {
                        //Si la imagen contiene la clase ocultar, la elimina
                        if (imagen.classList.contains("ocultar")) {
                            imagen.classList.remove("ocultar");
                            //Si era un enemigo, guardo en pos la posición donde quiero que salga el enemigo (2 filas debajo de la imagen y una a la derecha)
                            if (imagen.src == rutaGoomba) {
                                pos = i + 43;
                                //Llamo a crear enemigo
                                setTimeout(crearEnemigo,500);
                            }
                            //Si es una seta, suma la cantidad de puntos dependiendo de la fase en la que se encuentre
                            if (imagen.src == rutaSeta) {
                                puntos.innerText = parseInt(puntos.innerText) + parseInt(localStorage.getItem("puntosSeta"));
                            }
                            //Si es la bandera, quita la clase ocultar de la salida para mostrarla
                            if (imagen.src == rutaBandera) {
                                salida.classList.remove("ocultar");
                            }
                            //Si es una estrella, pongo poderEstrella en true para activarlo
                            if (imagen.src == rutaEstrella) {
                                poderEstrella = true;
                            }
                        }
                    }
                //Si no contiene una imagen, añade a cada cuadro la clase vacia para pintarlos
                } else {
                    cuadrosArray[i].classList.add("vacia");
                    cuadrosArray[i + 1].classList.add("vacia");
                    cuadrosArray[i + 2].classList.add("vacia");
                    cuadrosArray[i + 21].classList.add("vacia");
                    cuadrosArray[i + 22].classList.add("vacia");
                    cuadrosArray[i + 23].classList.add("vacia");
                }
            }
        }
    }
}
//Funcion que comprueba si un enemigo mata a Mario o Mario mata a un enemigo
function comprobarMuerte(posMuerte) {
    //Si coinciden en el mismo cuadro y no tiene el poder estrella, elimino a Mario, la clase mario del cuadro, y lo vuelvo a colocar arriba como en el inicio
    //También elimino una vida
    if (cuadrosArray[posMuerte].classList.contains("mario") && cuadrosArray[contadorFila].classList.contains("goomba")) {
        if (!poderEstrella) {
            mario.remove();
            cuadrosArray[contadorFila].classList.remove("mario")
            cuadrosArray[10].appendChild(mario);
            contadorFila = 10;
            corazones.removeChild(corazones.lastChild);
            contadorVidas--;
        }
        //Si el contador de vidas es 0, se termina la partida
        if (contadorVidas == 0) {
            finPartida();
        }
    }
    //Si coinciden en un mismo cuadro y mario tiene el poder estrella elimino al enemigo
    if (cuadrosArray[posMuerte].classList.contains("mario") && cuadrosArray[contadorFila].classList.contains("goomba")) {
        if (poderEstrella) {
            //Selecciono el enemigo que está en ese cuadro
            let enemic = cuadrosArray[posMuerte].getElementsByClassName("enemigo");
            //Elimino la clase estrella
            cuadrosArray[contadorFila].classList.remove("estrella");
            //Elimino al enemigo del array enemigos
            enemigos.splice(enemigos.indexOf(enemic[0]), 1);
            //Cambio el poder estrella a falso
            poderEstrella = false;
            //Elimino la clase goomba del cuadro donde estaba el enemigo
            cuadrosArray[posMuerte].classList.remove("goomba");
            //Elimino el enemigo
            enemic[0].remove();
            //Sumo 1000 puntos
            puntos.innerText = parseInt(puntos.innerText) + 1000;
        }
    }
}
//Función para pasar de nivel
function siguienteNivel() {
    //Reinicio el tablero
    tablero.innerText = "";
    //Guardo con localStorage los puntos y las vidas
    localStorage.setItem("puntos", puntos.innerText);
    localStorage.setItem("vidas", contadorVidas);
    //Paro el interval de los enemigos
    clearInterval(intervalo);
    //Indico que no es la primera fase y reinicio
    primeraVez = false;
    window.onload();
}
//Función que finaliza la partida si no tienes vidas
function finPartida() {
    //Creo el cartel final con un botón para volver a jugar
    let cartel = document.createElement("div");
    cartel.innerHTML = "GAME OVER" + "<br>" + "TU PUNTUACIÓN: " + puntos.innerText + "<br>";
    cartel.classList.add("cartel");
    document.body.appendChild(cartel);
    let boton = document.createElement("button");
    boton.innerText = "VOLVER A JUGAR";
    //Le doy un evento click al boton que recarga la página para empezar de nuevo
    boton.addEventListener("click", _ => {
        location.reload();
    });
    cartel.appendChild(boton);
    //Paro el interval de los enemigos
    clearInterval(intervalo);
    //Pongo este boolean en true para que Mario no pueda moverse
    final = true;
}
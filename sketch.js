let colorPickerInput, txt, inputImagen, img, capaDibujo; //variables control interfaz y dibujo
let fontBold, fontRegular, imgBurbuja, imgFondoInicio, imgMarco, imgFondoEditor, imgIconoPincel, imgCursor; //fuentes e imagenes para los botones y fondos
let sticker1, sticker2, sticker3, sticker4; 
let stickerSeleccionado = null; //sticker seleccionado para pegar, si no hay ninguno es null
let escala = 1, estado = 0, pincelActivo = true, burbujas = []; //escala boton inicio, estado de la app, si el pincel esta activo y array de burbujas
let titulo = "2000 Nostalgia Editor";

function preload(){ //carga de fuentes e imagenes
  fontBold = loadFont("font/Comic Sans Bold.ttf");
  fontRegular = loadFont("font/Comic Sans.ttf");
  imgBurbuja = loadImage("img/burbujas.png");
  imgFondoInicio = loadImage("img/fondo inicio.jpg");
  imgMarco = loadImage("img/pantalla.png");
  imgFondoEditor = loadImage("img/fondo.jpg");
  imgIconoPincel = loadImage("img/pincel.png");
  imgCursor = loadImage("img/cursor.png");
  sticker1 = loadImage("img/bubbles.png");
  sticker2 = loadImage("img/fish.png");
  sticker3 = loadImage("img/mariposa.png");
  sticker4 = loadImage("img/ojos.png");
}

function setup(){
  createCanvas(windowWidth, windowHeight);
  colorPickerInput = select('#colorpicker'); //input extraido de la practica p3_5_colorpicker
  txt = select('#txt'); //input extraido de la practica p3_2_textinput
  txt.hide(); 
  inputImagen = createFileInput(gestionarArchivo).hide(); //crea el boton para subir tu foto, le asigna la funcion y esconde el titulo de la imagen que se sobresalia de la columna
  inputImagen.style('width', '100px').style('color', 'transparent');
  capaDibujo = createGraphics(windowWidth, windowHeight); //capa para dibujar encima de la imagen, como que crea una capa transparente
  noCursor(); //oculta el cursor por defecto para poner el cursor.png 
}

function gestionarArchivo(archivo){ //esto se activa cuando se sube una imagen
  if (archivo.type === 'image'){ //comprueba que el archivo es una imagen
    img = loadImage(archivo.data); //la carga en la variable img
    capaDibujo.clear(); //limpia la capa de dibujo si la habia
  }
}

function draw(){ 
  if (estado === 0) dibujarInicio(); //segun el estado dibuja una cosa u otra siendo estado 0 el inicio y 1 la edicion
  else dibujarEdicion(); 
  imageMode(CORNER); //dibuja el cursor.png
  image(imgCursor, mouseX, mouseY, 30, 30); //se dibujo en modo corner para que la punta del cursor coincida con la posicion del raton 
}

function keyPressed(){ //funcion para guardar la imagen con ctrl+s
  if (estado === 1 && (key === 's' || key === 'S') && keyIsDown(CONTROL)){ //controla que solo funcione en el estado 1
    saveIMG(); 
    return false; //evita que se abra la ventana de guardar del navegador y se descargue automaticamente
  }
}

function saveIMG(){ //funcion para guardar la imagen editada
  let dimW = 800, dimH = 600; //tamaño de la imagen guardada
  let centroX = 180 + (width - 180) / 2; 
  let centroY = height / 2;
  let tempCanvas = createGraphics(dimW, dimH); //crea un canvas temporal para guardar la imagen
  
  if (img) tempCanvas.image(img, 0, 0, dimW, dimH); //dibuja la imagen subida en el canvas temporal
  dibujarTexto(tempCanvas, dimW / 2, dimH * 0.8, txt.value());
  tempCanvas.image(capaDibujo, -(centroX - dimW/2), -(centroY - dimH/2));
  save(tempCanvas, "mi_foto_nostalgica.jpg");
}

//estado 0, inicio
function dibujarInicio(){
  imageMode(CORNER);
  image(imgFondoInicio, 0, 0, width, height);
  [colorPickerInput, inputImagen, txt].forEach(el => el.hide()); //esconde los inputs en el inicio, esto se hizo porque generaba un error al cambiar de estado que dejaba los inputs visibles
  gestionarBurbujas();
  
  textAlign(CENTER, CENTER); //titulo principal
  for (let i = 0; i < titulo.length; i++){ //efecto onda en el titulo
    let charX = map(i, 0, titulo.length, width/2 - 400, width/2 + 400); //posicion x de cada letra
    let offsetWave = sin(frameCount * 0.05 + i * 0.3) * 20; 
    fill(0, 50);
    noStroke();
    textFont(fontBold);
    textSize(80);
    text(titulo[i], charX + 5, 150 + offsetWave + 5); //sombra
    fill(255, 255, 0);
    stroke(0, 102, 255);
    strokeWeight(6);
    text(titulo[i], charX, 150 + offsetWave); //dibuja cada letra con el efecto de onda
  }

//subtitulo descriptor del inicio
  fill(255);
  stroke(0);
  strokeWeight(4);
  textFont(fontRegular);
  textSize(40);
  text("Edita tus fotos al estilo de los 2000", width/2, 350);
  actualizarBotonInicio(width/2, height - 150, 280, 80); 
}

//estado 1, edicion
function dibujarEdicion(){
  imageMode(CORNER); 
  image(imgFondoEditor, 0, 0, width, height); //fondo
  let centroX = 180 + (width - 180) / 2, centroY = height / 2, dimW = 800, dimH = 600; //centro y dimensiones de la imagen subida

//columna izq
  noStroke();
  fill(0, 80, 180, 240);
  rect(0, 0, 180, height);
  fill(255);
  textAlign(LEFT, TOP);
  textFont(fontRegular);
  textSize(16);
  text("1. Sube tu foto", 20, 30);
  inputImagen.show().position(20, 60); //posiciona el boton para subir la imagen
  text("2. Color de pincel", 20, 130); 
  colorPickerInput.show().position(20, 160).style('width', '80px'); //posiciona el color picker
 //botones pincel y borrador
  dibujarBotonPincel(115, 155, 45, 45);
  dibujarBotonBorrador("Borrador", 20, 210, 140, 40, () => { //callback para el boton borrador: un callback es una funcion que le das a otra funcion como "instrucciones" para que sea ejecutada solo cuando ocurra un suceso especifico o se complete una tarea
    colorPickerInput.value("#000001"); 
    stickerSeleccionado = null; //quita el sticker seleccionado si habia
    pincelActivo = true; //activa el pincel
  });

//stickers
  textAlign(CENTER);
  fill(255);
  noStroke();
  text("3. Stickers", 60, 270);
  let misStickers = [sticker1, sticker2, sticker3, sticker4]; //array de los stickers
  for(let i = 0; i < 4; i++){ //dibuja los stickers en una cuadricula 2x2
    let columna = i % 2, fila = floor(i / 2); //calcula la columna y fila 
    let posX = 55 + (columna * 70), posY = 330 + (fila * 80);
    fill(255, 50);
    stroke(255);
    strokeWeight(1);
    rectMode(CENTER); //fondo del sticker
    rect(posX, posY, 60, 60, 10); 
    imageMode(CENTER);
    image(misStickers[i], posX, posY, 45, 45); //dibuja el sticker
    if (mouseIsPressed && dist(mouseX, mouseY, posX, posY) < 30) stickerSeleccionado = misStickers[i]; //si se hace click en el sticker lo selecciona
  }

//text_input
  fill(255);
  noStroke();
  text("4. Escribe", 60, 480); 
  txt.show().position(20, 500).style('width', '140px'); //posiciona el input de texto

//lienzo
  imageMode(CENTER);
  if (img) image(img, centroX, centroY, dimW, dimH); //dibuja la imagen subida (dimW=dimensionWidth, dimH=dimensionHeight)
  if (img) dibujarTexto(this, centroX, centroY + (dimH * 0.3), txt.value()); //dibuja el texto en la imagen

  image(capaDibujo, width/2, height/2); //dibuja la capa de dibujo encima de la imagen
  image(imgMarco, centroX, centroY, dimW + 80, dimH + 120); //dibuja el marco encima de todo

//pintar
  if (mouseIsPressed && abs(mouseX - centroX) < dimW/2 && abs(mouseY - centroY) < dimH/2){ //comprueba que el raton este dentro del area de la imagen (que no pinte por fuera)
    if (stickerSeleccionado){ //si hay un sticker seleccionado lo dibuja en la posicion del raton
      capaDibujo.imageMode(CENTER); //para que el sticker se dibuje centrado en la posicion del raton
      capaDibujo.image(stickerSeleccionado, mouseX, mouseY, 100, 100); //dibuja el sticker en la capa de dibujo
      stickerSeleccionado = null;  //quita el sticker seleccionado para que no se dibuje repetidamente
    } 
    else if (pincelActivo){ //si el pincel esta activo dibuja lineas
      if (colorPickerInput.value() === "#000001"){  
        capaDibujo.erase(); //modo borrador
        capaDibujo.strokeWeight(40); //grosor del borrador
      } 
      else{ //modo pincel
        capaDibujo.noErase(); //desactiva el modo borrador
        capaDibujo.stroke(colorPickerInput.value()); //color del pincel (elegido en el color picker)
        capaDibujo.strokeWeight(12); //grosor del pincel 
      }
      capaDibujo.line(pmouseX, pmouseY, mouseX, mouseY); //dibuja la linea en la capa de dibujo
      capaDibujo.noErase(); //asegura que el modo borrador este desactivado despues de pintar
    }
  }

  if (stickerSeleccionado){ //muestra el sticker seleccionado siguiendo al raton
    tint(255, 180); //transparencia para que se vea que es un sticker seleccionado
    image(stickerSeleccionado, mouseX, mouseY, 60, 60); //dibuja el sticker siguiendo al raton
    noTint(); //desactiva la transparencia
  }

  gestionarBurbujas(); //dibuja las burbujas del boton volver
  imageMode(CORNER); //dibuja el boton volver
  rectMode(CORNER); //para que el area de hover del boton coincida con el rectangulo
  dibujarBotonVolver(); 
  fill(255, 255, 0);
  noStroke();
  textFont(fontBold);
  textAlign(CENTER);
  text("Guarda (Ctrl+S)", 90, height - 120);
}

function dibujarTexto(objetivo, x, y, cadena){ //dibuja el texto con efecto arcoiris
  objetivo.push(); //guarda el estado previo del objetivo (puede ser el canvas principal o la capa de dibujo)
  objetivo.textAlign(CENTER, CENTER); 
  objetivo.textSize(30);
  objetivo.textFont(fontBold);
  let totalW = objetivo.textWidth(cadena); //ancho total del texto
  let startX = x - totalW / 2; //posicion inicial para centrar el texto
  for (let i = 0; i < cadena.length; i++){ //dibuja cada letra con un color diferente
    objetivo.colorMode(HSB); //modo de color HSB para el efecto arcoiris
    objetivo.fill(map(i, 0, cadena.length, 0, 360), 80, 90); //color basado en la posicion de la letra
    objetivo.stroke(0); 
    objetivo.strokeWeight(2);
    let letraX = startX + objetivo.textWidth(cadena.substring(0, i)); //posicion x de la letra actual
    objetivo.text(cadena[i], letraX + objetivo.textWidth(cadena[i])/2, y); //dibuja la letra centrada en su posicion
  }
  objetivo.pop();
}
//dibujo botones
//pincel
function dibujarBotonPincel(x, y, w, h){ 
  push(); //guarda el estado previo
  let hover = mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h; //comprueba si el raton esta encima del boton
  fill(pincelActivo ? [255, 255, 0] : 100); //cambia el color del boton segun si el pincel esta activo o no
  stroke(pincelActivo ? [0, 255, 0] : 255); //cambia el color del borde del boton segun si el pincel esta activo o no
  strokeWeight(2);
  rectMode(CORNER);
  rect(x, y, w, h, 8); 
  imageMode(CENTER); 
  image(imgIconoPincel, x + w/2, y + h/2, w*0.7, h*0.7); //dibuja el icono del pincel centrado en el boton
  if (hover && mouseIsPressed && frameCount % 10 === 0) pincelActivo = !pincelActivo; //cambia el estado del pincel al hacer click en el boton (con un retardo para evitar cambios rapidos)
  pop(); 
}
//borrador
function dibujarBotonBorrador(label, x, y, w, h, callback){ //callback es la funcion que se ejecuta al hacer click en el boton
  push();
  let hover = mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h; 
  fill(hover ? "#FFFF00" : "#00CCFF");
  stroke(255);
  strokeWeight(3);
  rect(x, y, w, h, 10);
  fill(0);
  noStroke();
  textAlign(CENTER, CENTER);
  textFont(fontBold);
  text(label, x + w / 2, y + h / 2);
  if (hover && mouseIsPressed) callback(); //ejecuta la funcion pasada
  pop();
}
//volver
function dibujarBotonVolver(){
  let vX = 30, vY = height - 80, vW = 120, vH = 50; //posicion y dimensiones del boton
  let hover = mouseX > vX && mouseX < vX + vW && mouseY > vY && mouseY < vY + vH; 
  if (hover){ //efecto burbujas al pasar por encima (si el raton esta encima del boton...)
    fill(255, 200, 0); 
    if (frameCount % 6 === 0) burbujas.push(new Burbuja(random(vX, vX + vW), vY)); //cada 6 frames crea una burbuja nueva en una posicion aleatoria dentro del boton
    if (mouseIsPressed) { estado = 0; img = null; } //si se hace click cambia el estado a 0 (inicio) y borra la imagen subida
  }
  else fill(255, 100, 100); 
  stroke(255); strokeWeight(3); rect(vX, vY, vW, vH, 15); 
  fill(255); noStroke(); textAlign(CENTER, CENTER); text("Inicio", vX + vW/2, vY + vH/2); 
}
//para que no se vea el boton cuando le das a voler
function actualizarBotonInicio(cX, cY, w, h){ 
  let hover = mouseX > cX - w/2 && mouseX < cX + w/2 && mouseY > cY - h/2 && mouseY < cY + h/2; 
  escala = lerp(escala, hover ? 1.1 : 1.0, 0.1); //efecto de escala al pasar por encima (hover)
  if (hover && frameCount % 5 === 0) burbujas.push(new Burbuja(random(cX-w/2, cX+w/2), cY)); //crea burbujas dentro del boton con un retardo de frames
  push();
    translate(cX, cY); 
    scale(escala);
    fill(255, 0, 150); 
    stroke(255); 
    strokeWeight(5);
    rect(-w/2, -h/2, w, h, 40);
    fill(255); noStroke(); textSize(30); text("Empieza a crear!", 0, 0);
  if (hover && mouseIsPressed) estado = 1; //cambia el estado a 1 (edicion) al hacer click
  pop();
}

//class burbuja para las fisicas
class Burbuja{
  constructor(x, y){ //posicion inicial
    this.x = x; this.y = y; //posicion
    this.size = random(10, 30); //tamaño
    this.speedY = random(2, 5); //velocidad
    this.opacity = 255; //opacidad
  }
  update(){ //actualiza la posicion y opacidad
    this.y -= this.speedY;
    this.opacity -= 3;
  }
  display(){ //dibuja la burbuja
    push();
    tint(255, this.opacity); 
    imageMode(CENTER);
    image(imgBurbuja, this.x, this.y, this.size, this.size); 
    pop();
  }
}

function gestionarBurbujas(){ //actualiza y dibuja las burbujas, elimina las que ya no son visibles
  for (let i = burbujas.length - 1; i >= 0; i--){ //recorre el array de burbujas hacia atras para poder eliminar elementos sin problemas
    burbujas[i].update(); //actualiza la burbuja
    burbujas[i].display(); //dibuja la burbuja
    if (burbujas[i].opacity <= 0) burbujas.splice(i, 1); //elimina la burbuja si ya no es visible
  }
}

function windowResized(){ //ajusta el canvas y la capa de dibujo al cambiar el tamaño de la ventana
  resizeCanvas(windowWidth, windowHeight);
  capaDibujo.resizeCanvas(windowWidth, windowHeight);
}
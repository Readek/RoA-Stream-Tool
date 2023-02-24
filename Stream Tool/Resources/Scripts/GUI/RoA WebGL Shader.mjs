// this script was made out of examples that can be found at https://webgl2fundamentals.org

const vertexShaderSource = `#version 300 es

// the vertex shader RoA uses is much more complicated, but here we
// don't care about lighting so this is just the example shader

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec2 a_position;
in vec2 a_texCoord;

// Used to pass in the resolution of the canvas
uniform vec2 u_resolution;

// Used to pass the texture coordinates to the fragment shader
out vec2 v_texCoord;

// all shaders have a main function
void main() {

  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = a_position / u_resolution;

  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

  // pass the texCoord to the fragment shader
  // The GPU will interpolate this value between points.
  v_texCoord = a_texCoord;
}
`;

const fragmentShaderSource = `#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. RoA's shader uses high precision.
precision highp float;
#define LOWPREC lowp // not sure what this does


// our character image
uniform sampler2D u_image;


// the texCoords passed in from the vertex shader.
in vec2 v_texCoord;

const int maxcolors = 9; // the maximum number of colors to be changed (9 is RoA's limit)

uniform vec4 colorIn[maxcolors];        // color to replace
uniform vec4 colorOut[maxcolors];       // desired color
uniform vec4 colorTolerance[maxcolors]; // HSVA tolerances
uniform vec4 blend[maxcolors];          // 1 = regular shading, 0 = EA shading
uniform int special;                    // certain skins use a modified shared logic


vec3 rgb_to_hsv(vec3 col)
{
    float H = 0.0;
    float S = 0.0;
    float V = 0.0;
    
    float M = max(col.r, max(col.g, col.b));
    float m = min(col.r, min(col.g, col.b));
    
    V = M;
    
    float C = M - m;
    
    if (C > 0.0)
    {
        if (M == col.r) H = mod( (col.g - col.b) / C, 6.0);
        if (M == col.g) H = (col.b - col.r) / C + 2.0;
        if (M == col.b) H = (col.r - col.g) / C + 4.0;
        H /= 6.0;
        S = C / V;
    }
    
    return vec3(H, S, V);
}

vec3 hsv_to_rgb(vec3 col)
{
    float H = col.r;
    float S = col.g;
    float V = col.b;
    
    float C = V * S;
    
    H *= 6.0;
    float X = C * (1.0 - abs( mod(H, 2.0) - 1.0 ));
    float m = V - C;
    C += m;
    X += m;
    
    if (H < 1.0) return vec3(C, X, m);
    if (H < 2.0) return vec3(X, C, m);
    if (H < 3.0) return vec3(m, C, X);
    if (H < 4.0) return vec3(m, X, C);
    if (H < 5.0) return vec3(X, m, C);
    else         return vec3(C, m, X);
}

// we need to declare an output for the fragment shader
out vec4 outColor;

// now this is where we get serious
void main() {

  // the current pixel we're looking at
  vec4 colorPixel = texture( u_image, v_texCoord );
  
  // to modify later if needed
  vec4 colorResult = colorPixel;
  
  // current pixel but in hsv, to compare the values with color ranges
  vec4 colorHSV = vec4( rgb_to_hsv( colorPixel.rgb ), colorPixel.a);


  // for every primary color / color part (max = 9) (won't break if no values found)
  for (int i=0; i< maxcolors; i+=1) {

    // og color in hsv (primary color)
    vec4 colorInHSV = vec4( rgb_to_hsv( colorIn[i].rgb ), colorIn[i].a);
    
    // see the hsv difference comparing the current pixel to the primary color
    vec4 colorDelta = colorHSV - colorInHSV;
    
    if (abs(colorDelta.r)>0.5) colorDelta.r -= sign(colorDelta.r);

    if ( all( lessThanEqual( abs(colorDelta), colorTolerance[i] ) ) ) {

      // this is our desired color
      vec4 tColorOut = colorOut[i];

      if (special == 8) { // THE SUMMIT KRAGG EXPERIENCE
        
        if (i == 0) { // for the first part (Kraggs rock)
  
          // this is the point in absolute pixels where the fade happens
          float effectY = 900.0/1292.0;
  
          if (effectY > v_texCoord.y){
  
            // all pixels above that will be white-ish
            tColorOut.r = 0.81960;
            tColorOut.g = 0.83529;
            tColorOut.b = 0.86667;
  
          } else if (v_texCoord.y < effectY + 16.0 / 1292.0){
  
            // pixels below will be as normal, but with a faded dithered transition
  
            // current coordinates in absolute pixels
            float corx = 1044.0 - v_texCoord.x * 1044.0;
            float cory = 1292.0 - v_texCoord.y * 1292.0;
  
            // some weird math for the dither effect idk
            float t_y = floor(cory * 0.25) * 4.0;
            float t_a = (t_y - 900.0)*0.125;
            float t_dither = (t_a * 4.0);
            float t_x = floor(corx * 0.5) + mod(t_dither, 4.0);
  
            // determines the color blend for the gradient
            t_y = floor((1292.0 - cory) * 0.25) * 4.0;
            t_a = (t_y - 900.0)*0.0625;
  
            // final colors of the pixel
            if (mod(t_x, 4.0) < 2.0){
                tColorOut.r = mix(0.81960,colorOut[i].r,t_a);
                tColorOut.g = mix(0.83529,colorOut[i].g,t_a);
                tColorOut.b = mix(0.86667,colorOut[i].b,t_a);
            }
            
          }

        }

      }
      

      vec4 colorOutHSV = vec4( rgb_to_hsv( tColorOut.rgb ), tColorOut.a);
    
      // we will add the hsv difference to the desired color
      // i agree this looks more complicated than it should
      colorResult = mix(
        tColorOut,
        vec4 ( hsv_to_rgb( vec3( mod( colorOutHSV.r + colorDelta.r, 1.0 ),
        clamp( colorOutHSV.g + colorDelta.g, 0.0, 1.0 ),
        clamp( colorOutHSV.b + colorDelta.b, 0.0, 1.0 ) ) ), 
        clamp( tColorOut.a + colorDelta.a, 0.0, 1.0) ),
        blend[i].x
      );
      
      // if the alpha was modified, we will always use the lower of the 2
      colorResult.a = min(colorResult.a, colorPixel.a);

    }
  }

  // the final color to be displayed
  outColor = colorResult;

}
`;

/* 
    colorIn         // original color, array of 4 [rgba] values for each color
    colorOut        // desired color, same as above
    colorTolerance  // color range, array of 4 [hsva] values
        
    // arrays need to have their values on a single array,
    // the GLSL shader will then separate them every 4 values
*/


// time to create our recolored character!
export class RoaRecolor {

  char;

  gl;
  positionBuffer;
  offset;

  constructor() {

    // initialize stuff
    this.canvas = document.createElement("canvas");
    this.glLocs = {};
    this.initializeShader();

  }

  /** Starts up the shader values */
  initializeShader() {

    // it's WebGL time, get ready to not understand anything (don't worry i dont either)
    const gl = this.canvas.getContext("webgl2", { premultipliedAlpha: false });

    // create the shader with the text above, then create the program
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vertexShader, fragmentShader);

    // look up where the vertex data needs to go.
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    const texCoordAttributeLocation = gl.getAttribLocation(program, "a_texCoord");

    // lookup uniforms
    this.glLocs.resolutionLoc = gl.getUniformLocation(program, "u_resolution");
    this.glLocs.imageLocation = gl.getUniformLocation(program, "u_image");
    // RoA specific uniforms
    this.glLocs.colorInLoc = gl.getUniformLocation(program, "colorIn");
    this.glLocs.colorOutLoc = gl.getUniformLocation(program, "colorOut");
    this.glLocs.colorToleranceLoc = gl.getUniformLocation(program, "colorTolerance");
    this.glLocs.blendLoc = gl.getUniformLocation(program, "blend");
    this.glLocs.specialLoc = gl.getUniformLocation(program, "special");

    // Create a vertex array object (attribute state)
    const vao = gl.createVertexArray();
    // and make it the one we're currently working with
    gl.bindVertexArray(vao);

    // Create a buffer and put a single pixel space rectangle in it (2 triangles)
    const positionBuffer = gl.createBuffer();

    // Turn on the attribute
    gl.enableVertexAttribArray(positionAttributeLocation);

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    const size = 2;          // 2 components per iteration
    const type = gl.FLOAT;   // the data is 32bit floats
    const normalize = false; // don't normalize the data
    const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    const offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

    // provide texture coordinates for the rectangle.
    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0.0,  0.0,
        1.0,  0.0,
        0.0,  1.0,
        0.0,  1.0,
        1.0,  0.0,
        1.0,  1.0,
    ]), gl.STATIC_DRAW);

    // Turn on the attribute
    gl.enableVertexAttribArray(texCoordAttributeLocation);

    // Tell the attribute how to get data out of texCoordBuffer (ARRAY_BUFFER)
    gl.vertexAttribPointer(texCoordAttributeLocation, size, type, normalize, stride, offset);

    // Create a texture.
    const texture = gl.createTexture();

    // make unit 0 the active texture uint
    // (ie, the unit all other texture commands will affect
    gl.activeTexture(gl.TEXTURE0 + 0);

    // Bind it to texture unit 0' 2D bind point
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the parameters so we don't need mips and so we're not filtering
    // and we don't repeat at the edges
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Bind the attribute/buffer set we want.
    gl.bindVertexArray(vao);

    // store to be used outside this function
    this.gl = gl;
    this.positionBuffer = positionBuffer;
    this.offset = offset;

  }


  updateData(char, colIn, colRan, blend, special) {

    this.char = char;
    this.updateColorData(colIn, colRan);
    this.updateBlend(blend);
    this.updateSpecial(special);

  }

  /**
   * Updates the shader color data values
   * @param {Array} colIn - Incoming original color data
   * @param {Array} colRan - Character's color ranges
   */
  updateColorData(colIn, colRan) {

    // create new arrays with the provided data
    const ogCols = Array(36).fill(0); // max of 9 parts * 4 because of rgba
    const colTol = Array(36).fill(0);

    // add in the new colors
    for (let i = 0; i < colIn.length; i++) {
      ogCols[i] = colIn[i];
    }
    // adds in the black border recolor
    if (this.char != "Trail") {
      ogCols[colIn.length + 3] = 1;
    }
    for (let i = 0; i < colRan.length; i++) {
      colTol[i] = colRan[i];
    }

    // update the shader values
    this.gl.uniform4fv(this.glLocs.colorInLoc, div255(ogCols));
    this.gl.uniform4fv(this.glLocs.colorToleranceLoc, divHSV(colTol));

  }

  /**
   * Determines shading blend
   * @param {Boolean} blend - False for regular shading, true for retro
   */
  updateBlend(blend) {

    let finalBlend = [];

    // this is a variable that the shader will use for Early Access colors
    // apparently, the game will also use this value for some character's parts
    // if 0, the color will have no shading
    if (blend) {
      finalBlend = Array(36).fill(0);
    } else {
      finalBlend = Array(36).fill(1);
      if (this.char == "Kragg" || this.char == "Absa") {
        for (let i = 0; i < 4; i++) {
          if (i < 4) {
            if (this.char == "Kragg") {
              // some kragg skins use 1.2 blend, but most of them (including custom
              // skin) use 1.1 so thats what we will use for all of them
              finalBlend[i] = 1.1;
            } else if (this.char == "Absa") {
              finalBlend[i] = 1.2;
            }
          }
        }
      }
    }

    // aaaand make it happen
    this.gl.uniform4fv(this.glLocs.blendLoc, finalBlend);
    
  }

  /**
   * Determines if special shader logic will be used
   * @param {Number} number - Special code
   */
  updateSpecial(number) {
    this.gl.uniform1i(this.glLocs.specialLoc, number);
  }

  /**
   * Updates the shader image to be used
   * @param {String} imgPath - Path to the image to add
   */
  async addImage(imgPath) {

    const skinImg = new Image();
    skinImg.src = imgPath;  // MUST BE SAME DOMAIN!!!
    await skinImg.decode(); // wait for the image to be loaded

    this.canvas.width = skinImg.width;
    this.canvas.height = skinImg.height;

    const gl = this.gl;

    // Upload the image into the texture
    const mipLevel = 0;               // the largest mip
    const internalFormat = gl.RGBA;   // format we want in the texture
    const srcFormat = gl.RGBA;        // format of data we are supplying
    const srcType = gl.UNSIGNED_BYTE; // type of data we are supplying
    gl.texImage2D(gl.TEXTURE_2D, mipLevel, internalFormat, srcFormat, srcType, skinImg);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Pass in the canvas resolution so we can convert from
    // pixels to clipspace in the shader
    gl.uniform2f(this.glLocs.resolutionLoc, gl.canvas.width, gl.canvas.height);

    // Tell the shader to get the texture from texture unit 0
    gl.uniform1i(this.imageLocation, 0);

    // Bind the position buffer so gl.bufferData that will be called
    // in setRectangle puts data in the position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);

    // Set a rectangle the same size as the image.
    setRectangle(gl, 0, 0, skinImg.width, skinImg.height);

  }

  // this will be called on each paint
  recolor(colorOut) {

    // if no code is sent, use the original colors
    const finalOut = colorOut ? colorOut : this.colorIn;

    // this is to clean up remaining values from previous codes
    const actualFinalOut = Array(36).fill(0);
    for (let i = 0; i < finalOut.length; i++) {
      actualFinalOut[i] = finalOut[i];
    }
    actualFinalOut[finalOut.length + 3] = 1; // alpha for last value
    
    // Pass in the uniform to the shader
    this.gl.uniform4fv(this.glLocs.colorOutLoc, div255(actualFinalOut));

    // Draw the rectangle.
    const primitiveType = this.gl.TRIANGLES;
    const count = 6;
    this.gl.drawArrays(primitiveType, this.offset, count);

    // to take an image out of a gl canvas, you need to capture it before
    // the main thread has finished, so it can only be done here
    return this.canvas.toDataURL();

  }

  
  /**
   * @typedef {Object} Skin
   * @property {String} hex - The skin color code to be used
   * @property {Boolean} blend - Makes the image have "Early Access" shading
   * @property {Array} alpha - Set the transparency for each part (for example: [1, 0.75, 0.5, 1])
   * @property {Boolean} golden - Adds golden shading to the character's black pixels
  */
  /**
   * Takes an image, then returns it in a different color with the provided color code
   * @param {String} charName - The name of the character to recolor
   * @param {String} imgSrc - The source image to be recolored
   * @param {Array} colIn - The original image colors to be recolored
   * @param {Array} colRan - The color range for color variations
   * @param {Skin} skin - Skin data
   * @returns {String} Image data to be used in a .src atribute
  */
  async getRoARecolor(char, imgSrc, colIn, colRan, skin) {
  
    // some skins use a special shader
    let special;
    if (skin.name == "Summit" && char == "Kragg") {
      special = 8;
    } else {
      special = 0; // cant be null
    }

    // at the image and wait for it to be added
    await this.addImage(imgSrc);

    // add a one to the final range so it recolors black borders
    const finalRan = [...colRan];
    if (char != "Trail") {
      finalRan.push(0, 0, 0, 1);
    }

    // update the shader data
    this.updateData(char, colIn, finalRan, skin.ea, special);
  
    // translate the hex into array
    const recolorRgb = hexDecode(skin.hex);

    if (char == "Orcane") { // orcane has green and yellow hidden parts
      for (let i = 0; i < 8; i++) {
        if (skin.golden) { // orcane is a very special boi
          recolorRgb[i+8] = 255;
        } else {
          // add the 1st colors as the 3rd colors, 2nd to 4th
          recolorRgb[i+8] = recolorRgb[i];
        }
      }
    }
  
    // if transparency, add the data to the 4th value of each color
    if (skin.alpha) {
      for (let i = 0; i < recolorRgb.length; i++) {
        if ((i+1)%4 == 0) {
          recolorRgb[i] = skin.alpha[[((i+1) / 4) - 1]];
        }
      }
    }
  
    // golden skins have a predefined color for black pixels
    if (skin.golden) {
      recolorRgb.push(76, 53, 0, 1);
    }
  
    // render the actual image
    return this.recolor(recolorRgb);
    
  }
  
}


/**
  * Creates and compiles a shader.
  *
  * @param {!WebGLRenderingContext} gl The WebGL Context.
  * @param {string} shaderSource The GLSL source code for the shader.
  * @param {number} shaderType The type of shader, VERTEX_SHADER or
  *     FRAGMENT_SHADER.
  * @return {!WebGLShader} The shader.
*/
function compileShader(gl, shaderType, shaderSource) {
  // Create the shader object
  const shader = gl.createShader(shaderType);
  
  // Set the shader source code.
  gl.shaderSource(shader, shaderSource);
  
  // Compile the shader
  gl.compileShader(shader);
  
  // Check if it compiled
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!success) {
    // Something went wrong during compilation; get the error
    throw "could not compile shader:" + gl.getShaderInfoLog(shader);
  }
  
  return shader;
}

/**
  * Creates a program from 2 shaders.
  *
  * @param {!WebGLRenderingContext) gl The WebGL context.
  * @param {!WebGLShader} vertexShader A vertex shader.
  * @param {!WebGLShader} fragmentShader A fragment shader.
  * @return {!WebGLProgram} A program.
*/
function createProgram(gl, vertexShader, fragmentShader) {
  // create a program.
  const program = gl.createProgram();
  
  // attach the shaders.
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  
  // link the program.
  gl.linkProgram(program);
  
  // Check if it linked.
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success) {
      // something went wrong with the link
      throw ("program filed to link:" + gl.getProgramInfoLog (program));
  }
  
  return program;
};

function setRectangle(gl, x, y, width, height) {
  const x1 = x;
  const x2 = x + width;
  const y1 = y;
  const y2 = y + height;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
     x1, y1,
     x2, y1,
     x1, y2,
     x1, y2,
     x2, y1,
     x2, y2,
  ]), gl.STATIC_DRAW);
}



// shaders need the rbga values on a [0~1] range
function div255(array) {
  const newArray = [];
  for (let i = 1; i < array.length + 1; i++) {
    if (i % 4 != 0) {
      newArray[i-1] = array[i-1]/255;
    } else {
      newArray[i-1] = array[i-1];
    }
  }
  return newArray;
}
// same for hsva
function divHSV(array) {
  const newArray = [];
  let count = 0;
  for (let i = 0; i < array.length; i++) {
    count++;
    if (count == 1) {
      newArray[i] = array[i]/360;
    } else if (count == 2 || count == 3) {
      newArray[i] = array[i]/100;
    } else {
      newArray[i] = array[i];
      count = 0;
    }
  }
  return newArray;
}
/** Convers a hex code into an rgb array */
function hex2rgb(hex) {
  const rgb = [];
  const bigint = parseInt(hex, 16);
  rgb[0] = (bigint >> 16) & 255;
  rgb[1] = (bigint >> 8) & 255;
  rgb[2] = bigint & 255;
  return rgb;
}

function hexDecode(hex) {

  // delete those "-" from the code
  let newHex = hex.replace(/-/g, "");

  // split each color for every 6 characters
  const charHex = newHex.match(/.{1,6}/g);

  // create an array for the shader with rgba values
  const charRGB = [];
  for (let i = 0; i < charHex.length; i++) {
      const newArr = hex2rgb(charHex[i]);
      charRGB.push(newArr[0], newArr[1], newArr[2], 1); //r, g, b, a
  }

  // removes the extra rgb generated by the end of the code
  charRGB.splice(charRGB.length-4);
  
  return charRGB;

}

"use strict";

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
class RoaRecolor {

  constructor(char, colIn, colRan, golden) {

    this.colorIn = [...colIn];
    this.colorTolerance = [...colRan];

    // this will store whatever image you want to add in
    this.charImg;

    // this is a variable that the shader will use for Early Access colors
    // apparently, the game will also use this value for some character's parts
    // if 0, the color will have no shading
    this.blend = [];
    if (char.name == "Kragg" || char.name == "Absa") {
      for (let i = 0; i < this.colorIn.length; i++) {
        if (i < 4) {
          this.blend.push(1.1);
        } else {
          this.blend.push(1);
        }
      }
    } else {
      for (let i = 0; i < this.colorIn.length; i++) {
        this.blend.push(1);
      }
    }

    // if this is a golden skin, black pixels are altered
    if (golden) {
      this.colorIn.push(0, 0, 0, 1);
      this.colorTolerance.push(0, 0, 0, 1);
      this.blend.push(1, 1, 1, 1);
    }

  }


  async addImage(canvas, imgPath) {

    const skinImg = new Image();
    skinImg.src = imgPath;  // MUST BE SAME DOMAIN!!!
    await skinImg.decode(); // wait for the image to be loaded

    canvas.width = skinImg.width;
    canvas.height = skinImg.height;
    

    // it's WebGL time, get ready to not understand anything (don't worry i dont either)
    const gl = canvas.getContext("webgl2", { premultipliedAlpha: false });

    // create the shader with the text above, then create the program
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vertexShader, fragmentShader);

    // look up where the vertex data needs to go.
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    const texCoordAttributeLocation = gl.getAttribLocation(program, "a_texCoord");

    // lookup uniforms
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const imageLocation = gl.getUniformLocation(program, "u_image");
    // RoA specific uniforms
    const colorInLoc = gl.getUniformLocation(program, "colorIn");
    const colorOutLoc = gl.getUniformLocation(program, "colorOut");
    const colorToleranceLoc = gl.getUniformLocation(program, "colorTolerance");
    const blendLoc = gl.getUniformLocation(program, "blend");

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

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Bind the attribute/buffer set we want.
    gl.bindVertexArray(vao);

    // Pass in the canvas resolution so we can convert from
    // pixels to clipspace in the shader
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

    // Tell the shader to get the texture from texture unit 0
    gl.uniform1i(imageLocation, 0);

    // Pass in the uniforms to the shader
    gl.uniform4fv(colorInLoc, div255(this.colorIn));
    gl.uniform4fv(colorToleranceLoc, divHSV(this.colorTolerance));
    gl.uniform4fv(blendLoc, this.blend);

    // Bind the position buffer so gl.bufferData that will be called
    // in setRectangle puts data in the position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Set a rectangle the same size as the image.
    setRectangle(gl, 0, 0, skinImg.width, skinImg.height);


    // store everything we just generated
    this.charImg = {
      canvas : canvas,
      gl : gl,
      colorInLoc : colorInLoc,
      colorToleranceLoc : colorToleranceLoc,
      blendLoc : blendLoc,
      colorOutLoc : colorOutLoc,
      offset : offset,
    }

  }

  // its finally time to recolor the image
  recolor(colorOut) {
    // if no code is sent, use the original colors
    return render(this.charImg, colorOut ? colorOut : this.colorIn);
  }

  // to hot-change retro shading
  changeBlend(oneOrZero) {
    const gl = this.charImg.gl;
    this.blend = [];
    for (let i = 0; i < this.colorIn.length; i++) {
      if (oneOrZero) {
        this.blend.push(1);
      } else {
        this.blend.push(0);
      }        
    }
    gl.uniform4fv(this.charImg.blendLoc, this.blend);
  }
  
}

// this will be called on each paint
function render(glCan, colorOut) {

  // get what we loaded on startup
  const canvas = glCan.canvas;
  const gl = glCan.gl;
  const colorOutLoc = glCan.colorOutLoc;
  const offset = glCan.offset;
  
  // Pass in the uniform to the shader
  gl.uniform4fv(colorOutLoc, div255(colorOut));

  // Draw the rectangle.
  const primitiveType = gl.TRIANGLES;
  const count = 6;
  gl.drawArrays(primitiveType, offset, count);


  // to take an image out of a gl canvas, you need to capture it before
  // the main thread has finished, so it can only be done here
  return canvas.toDataURL();

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
  return charRGB;

}
function hex2rgb(hex) {
  const rgb = [];
  const bigint = parseInt(hex, 16);
  rgb[0] = (bigint >> 16) & 255;
  rgb[1] = (bigint >> 8) & 255;
  rgb[2] = bigint & 255;
  return rgb;
}

// and finally, what we will use from the outside
/**
 * Takes an image, then returns it in a different color with the provided color code
 * @param {String} charName - The name of the character to recolor
 * @param {String} imgSrc - The source image to be recolored
 * @param {Array} colIn - The original image colors to be recolored
 * @param {Array} colRan - The color range for color variations
 * @param {String} code - The skin color code to be used
 * @param {Boolean} blend - Makes the image have "Early Access" shading
 * @param {Array} alpha - Set the transparency for each part (for example: [1, 0.75, 0.5, 1])
 * @param {Boolean} golden - Adds golden shading to the character's black pixels
 * @returns {String} Image data to be used in a .src atribute
 */
async function getRoARecolor(charName, imgSrc, colIn, colRan, code, blend, alpha, golden) {

  const recolorCanvas = document.createElement("canvas");
  const recolorRgb = hexDecode(code);

  // removes the extra rgb generated by the end of the code
  recolorRgb.splice(recolorRgb.length-4);

  if (charName == "Orcane") { // orcane has green and yellow hidden parts
    for (let i = 0; i < 8; i++) {
      if (golden) { // orcane is a very special boi
        recolorRgb[i+8] = 255;
      } else {
        // add the 1st colors as the 3rd colors, 2nd to 4th
        recolorRgb[i+8] = recolorRgb[i];
      }
    }
  }

  // initialize our lovely recolor
  const roaRecolor = new RoaRecolor(charName, colIn, colRan, golden);

  // additional stuff
  await roaRecolor.addImage(recolorCanvas, imgSrc);
  if (blend) {
    roaRecolor.changeBlend(0);
  }
  if (alpha) {
    for (let i = 0; i < recolorRgb.length; i++) {
      if ((i+1)%4 == 0) {
        recolorRgb[i] = alpha[[((i+1) / 4) - 1]];
      }
    }
  }
  if (golden) {
    recolorRgb.push(76, 53, 0, 1);
  }

  // render the actual image
  return roaRecolor.recolor(recolorRgb);

}
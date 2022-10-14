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


/*
    Character Database

    "ogColor" values are RGBA, "colorRange" values are HSVA 

    These values come from the Character Templates on the Workshop

    Some values from the templates were wrong or outdated:
    Kragg: Skin from "121, 173, 93" to "121, 173, 100"
*/

const recolorCharData = {
  "Clairen": {
    ogColor : [
      65, 54, 80, 1,      // Body
      69, 69, 89, 1,      // Suit
      170, 34, 74, 1,     // Cape
      181, 181, 181, 1,   // Armor
      255, 230, 99, 1,    // Belt
      255, 13, 106, 1,    // Plasma
      0, 255, 247, 1,     // Plasma Tipper
      /* 0, 255, 0, 1     // CSS Highlight (for internal reference) */
    ],
    colorRange : [
      4, 7, 12, 1,        // Body
      6, 5, 17, 1,        // Suit
      4, 7, 25, 1,        // Cape
      4, 1, 25, 1,        // Armor
      13, 18, 15, 1,      // Belt
      24, 60, 30, 1,      // Plasma
      40, 85, 50, 1,      // Plasma Tipper
      /* 0, 0, 0, 1       // CSS Highlight */
    ]
  },
  "Forsburn" : {
    ogColor : [
      116, 110, 108, 1,   // Cloak
      128, 96, 28, 1,     // Body
      255, 233, 0, 1,     // Yellow Flame
      255, 127, 0, 1,     // Orange Flame
      170, 0, 0, 1,       // Red Flame
      36, 34, 36, 1,      // Dark Cloak
      255, 255, 228, 1    // Skull
    ],
    colorRange : [
      36, 10, 30, 1,      // Cloak
      29, 25, 60, 1,      // Body
      18, 10, 10, 1,      // Yellow Flame
      18, 10, 10, 1,      // Orange Flame
      18, 15, 50, 1,      // Red Flame
      18, 10, 10, 1,      // Dark Cloak
      4, 15, 30, 1        // Skull
      ]
  },
  "Zetterburn" : {
    ogColor : [
      122, 90, 78, 1,     // Body
      220, 203, 105, 1,   // Hands
      255, 233, 0, 1,     // Yellow flame
      255, 127, 0, 1,     // Orange flame
      170, 0, 0, 1        // Red Flame
    ],
    colorRange : [
      36, 30, 40, 1,      // Body
      24, 30, 60, 1,      // Hands
      18, 90, 5, 1,       // Yellow flame
      18, 10, 10, 1,      // Orange flame
      18, 14, 20, 1       // Red Flame
    ]
  },
  "Wrastor" : {
    ogColor : [
      168, 87, 143, 1,    // Body
      97, 68, 96, 1,      // Hands
      141, 231, 255, 1,   // Scarf
      246, 173, 197, 1,   // Belly
      230, 218, 25, 1     // Beak
    ],
    colorRange : [
      27, 13, 50, 1,      // Body
      18, 15, 30, 1,      // Hands
      27, 30, 50, 1,      // Scarf
      18, 5, 40, 1,       // Belly
      18, 5, 60, 1        // Beak
    ]
  },
  "Absa" : {
    ogColor : [
      120, 121, 161, 1,   // Body
      231, 121, 185, 1,   // Hair
      130, 173, 177, 1,   // Lightning
      187, 155, 143, 1,   // Horns
      214, 215, 244, 1    // Belly
    ],
    colorRange : [
      8, 20, 80, 1,       // Body
      54, 15, 60, 1,      // Hair
      18, 30, 50, 1,      // Lightning
      4, 15, 60, 1,       // Horns
      18, 15, 15, 1,      // Belly
    ]
  },
  "Elliana" : {
    ogColor : [
      213, 128, 87, 1,    // Mech
      150, 156, 145, 1,   // Trim
      175, 145, 200, 1,   // Snek
      157, 212, 84, 1,    // Propellers
      137, 198, 194, 1,   // Weapons
      72, 69, 60, 1       // Clothes
    ],
    colorRange : [
      15, 27, 41, 1,      // Mech
      16, 28, 45, 1,      // Trim
      11, 24, 23, 1,      // Snek
      20, 29, 60, 1,      // Propellers
      8, 23, 19, 1,       // Weapons
      17, 4, 11, 1        // Clothes
    ]
  },
  "Sylvanos" : {
    ogColor : [
      50, 54, 40, 1,      // Body
      126, 167, 87, 1,    // Leaves
      145, 86, 70, 1,     // Bark (haha)
      196, 44, 69, 1,     // Petals 1
      242, 208, 134, 1    // Petals 2
    ],
    colorRange : [
      4, 5, 8, 1,         // Body
      4, 17, 60, 1,       // Leaves
      4, 15, 31, 1,       // Bark
      10, 8, 34, 1,       // Petals 1
      36, 11, 8, 1,       // Petals 2
    ]
  },
  "Maypul" : {
    ogColor : [
      113, 155, 111, 1,   // Body
      228, 225, 173, 1,   // Belly
      169, 245, 124, 1,   // Leaf
      65, 62, 55, 1,      // Mark
      195, 135, 101, 1    // Vines
    ],
    colorRange : [
      45, 33, 80, 1,      // Body
      36, 56, 60, 1,      // Belly
      54, 7, 70, 1,       // Leaf
      54, 15, 35, 1,      // Mark
      15, 25, 55, 1       // Vines
    ]
  },
  "Kragg" : {
    ogColor : [
      136, 104, 93, 1,    // Rock
      121, 173, 100, 1,   // Chitin
      213, 216, 221, 1,   // Armor
      60, 36, 36, 1       // Dark Rock
    ],
    colorRange : [
      54, 29, 80, 1,      // Rock
      36, 50, 60, 1,      // Chitin
      27, 20, 65, 1,      // Armor
      0, 0, 0, 1          // Dark Rock
    ]
  },
  "Orcane" : {
    ogColor : [
      59, 73, 135, 1,     // Body
      205, 247, 247, 1,   // Belly
      0, 255, 0, 1,       // Highlight
      255, 255, 0, 1      // Highlight Golden
    ],
    colorRange : [
      18, 30, 40, 1,      // Body
      22, 30, 65, 1,      // Belly
      2, 0, 0, 0,         // Highlight
      2, 0, 0, 0          // Highlight Golden
    ],
    actualParts : 2
  },
  "Etalus" : {
    ogColor : [
      251, 250, 252, 1,   // Body
      180, 230, 230, 1,   // Ice
      67, 68, 87, 1,      // Dark Ice
      /* 253, 252, 255, 1,// Ice Change Back?
      251, 250, 252, 1    // Body Go Back?  */
    ],
    colorRange : [
      15, 41, 70, 1,      // Body
      54, 15, 50, 1,      // Ice
      4, 10, 50, 1,       // Dark Ice
      /* 0, 0, 0, 1,      // Ice Change Back?
      0, 0, 0, 1          // Body Go Back?  */
    ]
  },
  "Ranno" : {
    ogColor : [
      58, 210, 228, 1,    // Body Light
      44, 53, 113, 1,     // Body Dark
      255, 124, 0, 1,     // Pants
      193, 193, 157, 1,   // Bandages
      182, 244, 48, 1,    // Poison
      /* 255, 0, 0, 1,    // CSS Highlight (for internal referencing)
      36, 208, 255, 1     // CSS Highlight (what's actually displayed) */
    ],
    colorRange : [
      44, 62, 50, 1,      // Body Light
      5, 8, 10, 1,        // Body Dark
      18, 5, 45, 1,       // Pants
      22, 11, 30, 1,      // Bandages
      27, 22, 33, 1,      // Poison
      /* 0, 0, 0, 1       //  */
    ]
  },
  "Ori and Sein" : {
    ogColor : [ // reminder, these are the sprite colors, default palette uses different colors
      243, 235, 253, 1,   // Body 1
      253, 238, 253, 1,   // Body 2
      69, 255, 64, 1,     // Eyes
      93, 203, 241, 1,    // Sein
      255, 200, 33, 1,    // Energy
      /* 255, 0, 0, 1     // CSS Highlight */
    ],
    colorRange : [
      4, 40, 40, 1,       // Body 1
      4, 40, 40, 1,       // Body 2
      54, 40, 10, 1,      // Eyes
      54, 40, 60, 1,      // Sein
      54, 40, 40, 1,      // Energy
      /* 0, 0, 0, 1       // CSS Highlight */
    ],
    actualColor : [ // used by the Default skin
      248, 245, 252, 1,   // Body 1
      248, 245, 252, 1,   // Body 2
      0, 0, 0, 1,         // Eyes
      93, 203, 241, 1,    // Sein
      255, 200, 33, 1,    // Energy
      /* 36, 208, 255, 1  // CSS Highlight (every palette will use this slot) */
    ],
  },
  "Shovel Knight" : {
    ogColor : [
      58, 210, 228, 1,    // Armor Light
      59, 73, 135, 1,     // Armor Dark
      255, 255, 0, 1,     // Trim
      220, 203, 105, 1,   // Horns
      /* 255, 0, 0, 1,    // CSS Highlight (for internal reference)
      36, 208, 255, 1     // CSS Highlight (what's actually displayed) */
    ],
    colorRange : [
      8, 61, 37, 1,       // Armor Light
      8, 13, 37, 1,       // Armor Dark
      26, 91, 1, 1,       // Trim
      18, 42, 37, 1,      // Horns
      /* 0, 0, 0, 1       // CSS Highlight */
    ]
  },
  "Mollo" : {
    ogColor : [
      175, 96, 136, 1,    // Body
      244, 212, 173, 1,   // Fluff
      145, 47, 41, 1,     // Cloth
      74, 53, 76, 1,      // Wings
      255, 71, 71, 1,     // Bombs
      255, 145, 52, 1,    // Embers
      40, 0, 45, 1        // Eyes
    ],
    colorRange : [
      7.2, 6, 30, 1,      // Body
      21.6, 19, 29, 1,    // Fluff
      7.2, 15, 34, 1,     // Cloth
      4.42, 22, 18, 1,    // Wings
      0.72, 33, 46, 1,    // Bombs
      23.4, 14, 46, 1,    // Embers
      3.6, 36, 27, 1      // Eyes
    ]
  },
  "Hodan" : {
    ogColor : [
      137, 232, 255, 1,   // Steam
      231, 84, 84, 1,     // Body
      139, 79, 40, 1,     // Hands
      82, 82, 235, 1,     // Towel
      255, 220, 66, 1,    // Towel Stripe
      253, 253, 253, 1,   // Fur 1
      201, 220, 232, 1,   // Fur 2
    ],
    colorRange : [
      18, 39, 37, 1,      // Steam
      0.72, 37, 23, 1,    // Body
      11.88, 19, 30, 1,   // Hands
      7.2, 27, 32, 1,     // Towel
      21.6, 5.5, 2, 1,    // Towel Stripe
      0.72, 0.2, 0.2, 1,  // Fur 1
      15.12, 28, 9, 1,    // Fur 2
    ]
  },
  "Pomme" : {
    ogColor : [
      233, 190, 224, 1,   // Skin
      167, 83, 132, 1,    // Jacket
      103, 49, 137, 1,    // Clothes
      177, 47, 102, 1,    // Eyes
      183, 101, 184, 1,   // Hair
      219, 74, 195, 1     // Music
        
    ],
    colorRange : [
      12.996, 19, 36, 1,  // Skin
      3.996, 26, 37, 1,   // Jacket
      12.024, 26, 37, 1,  // Clothes
      3.6, 1, 1, 1,       // Eyes
      18, 13, 34, 1,      // Hair
      1.872, 48, 16.5, 1  // Music
    ]
  },
  "Olympia" : {
    ogColor : [
      236, 141, 202, 1,   // Right Crystal
      141, 236, 175, 1,   // Left Crystal
      184, 128, 83, 1,    // Body
      228, 133, 116, 1,   // Tail
      247, 243, 249, 1,   // Pants
      255, 249, 249, 1,   // Shine
      54, 123, 141, 1,    // Eyes
    ],
    colorRange : [
      21.6, 50, 50, 1,     // Crystal Light
      21.6, 50, 50, 1,     // Crystal Dark
      12.6, 15, 36, 1,     // Body
      5.04, 2, 25, 1,      // Tail
      10.8, 6, 50, 1,      // Pants
      5.04, 5, 0, 1,       // Shine
      9.72, 75, 40, 1,     // Eyes
    ],
    actualColor : [ // used by the Default skin
      236, 141, 202, 1,   // Right Crystal
      236, 141, 202, 1,   // Left Crystal
      184, 128, 83, 1,    // Body
      228, 133, 116, 1,   // Tail
      247, 243, 249, 1,   // Pants
      255, 249, 249, 1,   // Shine
      54, 123, 141, 1,    // Eyes
    ]
  }
}


// time to create our recolored character!
class RoaRecolor {

  constructor(char) {
    this.colorIn = [...recolorCharData[char].ogColor];
    this.colorTolerance = [...recolorCharData[char].colorRange];

    //this will store whatever image you want to add in
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
async function getRoARecolor(charName, imgSrc, code, blend, alpha) {
  
  const recolorCanvas = document.createElement("canvas");
  const recolorRgb = hexDecode(code);

  const roaRecolor = new RoaRecolor(charName);
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
  return roaRecolor.recolor(recolorRgb);

}
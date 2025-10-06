(()=>{async function _(t,e,o,a){let s=t.canvas,i=s.width,c=s.height;function n(p,y){let l=t.createShader(p);if(t.shaderSource(l,y),t.compileShader(l),!t.getShaderParameter(l,t.COMPILE_STATUS))throw new Error(t.getShaderInfoLog(l));return l}let r=n(t.VERTEX_SHADER,`
        attribute vec2 a_position;
        attribute vec2 a_texCoord;
        varying vec2 v_texCoord;
        void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
            v_texCoord = a_texCoord;
        }
    `),f=n(t.FRAGMENT_SHADER,a),u=t.createProgram();if(t.attachShader(u,r),t.attachShader(u,f),t.linkProgram(u),!t.getProgramParameter(u,t.LINK_STATUS))throw new Error(t.getProgramInfoLog(u));t.useProgram(u);let A=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,A),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,0,0,1,-1,1,0,-1,1,0,1,-1,1,0,1,1,-1,1,0,1,1,1,1]),t.STATIC_DRAW);let w=t.getAttribLocation(u,"a_position"),E=t.getAttribLocation(u,"a_texCoord");t.enableVertexAttribArray(w),t.vertexAttribPointer(w,2,t.FLOAT,!1,16,0),t.enableVertexAttribArray(E),t.vertexAttribPointer(E,2,t.FLOAT,!1,16,8);function T(p,y){let l=t.createTexture();return t.activeTexture(t.TEXTURE0+y),t.bindTexture(t.TEXTURE_2D,l),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,t.RGBA,t.UNSIGNED_BYTE,p),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),l}T(e,0),T(o,1);let C=t.getUniformLocation(u,"u_base"),U=t.getUniformLocation(u,"u_top");return t.uniform1i(C,0),t.uniform1i(U,1),t.viewport(0,0,i,c),t.clearColor(0,0,0,0),t.clear(t.COLOR_BUFFER_BIT),t.drawArrays(t.TRIANGLES,0,6),s}var x={symmetricOverlay:`
    precision mediump float;
    uniform sampler2D u_base;
    uniform sampler2D u_top;
    varying vec2 v_texCoord;

    float overlay(float a, float b) {
        return a < 0.5
            ? 2.0 * a * b
            : 1.0 - 2.0 * (1.0 - a) * (1.0 - b);
    }

    float symmetricOverlay(float a, float b) {
        return (overlay(a, b) + overlay(b, a)) / 2.0;
    }

    void main() {
        vec4 base = texture2D(u_base, v_texCoord);
        vec4 top  = texture2D(u_top, v_texCoord);
        gl_FragColor = vec4(
            symmetricOverlay(base.r, top.r),
            symmetricOverlay(base.g, top.g),
            symmetricOverlay(base.b, top.b),
            max(base.a, top.a)
        );
    }
    `};function m(t){return Math.min(255,t)}function h(t){return Math.max(0,t)}function F(t){return Math.min(255,Math.max(0,t))}function b(t,e){return t<128?t*e>>7:255-((255-t)*(255-e)>>7)}var L={add:(t,e)=>m(t+e),subtract:(t,e)=>h(t-e),stamp:(t,e)=>F(t-2*e+256),difference:(t,e)=>Math.abs(t-e),negation:(t,e)=>255-Math.abs(255-t-e),multiply:(t,e)=>t*e/255,darken:(t,e)=>Math.min(t,e),lighten:(t,e)=>Math.max(t,e),colorDodge:(t,e)=>e===255?255:m(t*255/(255-e)),colorBurn:(t,e)=>e===0?0:h(255-(255-t)*255/e),screen:(t,e)=>255-(255-t)*(255-e)/255,overlay:(t,e)=>b(t,e),hardLight:(t,e)=>e<128?t*e>>7:255-((255-t)*(255-e)>>7),softLight:(t,e)=>e,reflect:(t,e)=>e===255?255:m(t*t/(255-e)),glow:(t,e)=>t===255?255:m(e*e/(255-t)),freeze:(t,e)=>e===0?0:h(255-(255-t)*(255-t)/e),heat:(t,e)=>t===0?0:h(255-(255-e)*(255-e)/t),and:(t,e)=>t&e,or:(t,e)=>t|e,xor:(t,e)=>t^e,shadow:(t,e)=>e*t*t/65025,symmetricOverlay:(t,e)=>b(t,e)+b(e,t)>>1};function D(t,e,o,a){let s=L[a];if(!s)throw new Error(`Blend mode not supported: ${a}`);let i=t.createImageData(e.width,e.height),c=e.data,n=o.data,d=i.data;for(let r=0;r<c.length;r+=4)d[r]=s(c[r],n[r]),d[r+1]=s(c[r+1],n[r+1]),d[r+2]=s(c[r+2],n[r+2]),d[r+3]=Math.max(c[r+3],n[r+3]);return i}var R={normal:"source-over",add:"lighter",difference:"difference",multiply:"multiply",darken:"darken",lighten:"lighten",colorDodge:"color-dodge",colorBurn:"color-burn",screen:"screen",overlay:"overlay",hardLight:"hard-light",softLight:"soft-light",xor:"xor",exclusion:"exclusion"};function S(t,e){let o=document.createElement("canvas");o.width=t,o.height=e;let a=o.getContext("webgl")||o.getContext("experimental-webgl");return a?{canvas:o,gl:a}:null}function g(t,e,o,a=!0){let s=t.width,i=t.height;if(a&&x[o]){let d=S(s,i);if(console.log("glInfo",d),d){let{canvas:r,gl:f}=d;return _(f,t,e,x[o])}}let c=document.createElement("canvas");c.width=s,c.height=i;let n=c.getContext("2d");if(n.globalCompositeOperation="source-over",n.drawImage(t,0,0),R[o])n.globalCompositeOperation=R[o],n.drawImage(e,0,0);else{let d=n.getImageData(0,0,s,i),r=document.createElement("canvas");r.width=s,r.height=i,r.getContext("2d").drawImage(e,0,0);let f=r.getContext("2d").getImageData(0,0,s,i),u=D(n,d,f,o);n.putImageData(u,0,0)}return c}async function I(t){try{return(await Neutralino.filesystem.getStats(t)).isFile}catch(e){if(e.code==="NE_FS_NOPATHE")return!1;throw e}}async function v(t){try{if(!await I(t)){console.error(`Image not found: ${t}`);return}let o=await Neutralino.filesystem.readBinaryFile(t),a=new Blob([o],{type:"image/png"});return URL.createObjectURL(a)}catch(e){console.error("Failed to load image:",e)}}async function B(){return{photo:await v("tests/fixtures/photo.jpg"),gradient:await v("tests/fixtures/gradient.png")}}async function O(t,e){let a=t.toDataURL("image/png").split(",")[1];await Neutralino.filesystem.writeFile(e,a,"base64")}async function M(){let t=await B(),e=["normal","add","subtract","stamp","difference","negation","multiply","darken","lighten","colorDodge","colorBurn","screen","overlay","hardLight","softLight","reflect","glow","freeze","heat","and","or","xor","shadow","symmetricOverlay"],o={};for(let a of e){let s=Date.now(),i=await g(t.photo,t.gradient,a),n=Date.now()-s;o[a]=n+"ms",i.style.margin="4px",i.title=a,document.body.appendChild(i),await O(i,`tests/output/${a}.png`)}console.log("Blend benchmark results:",o),await Neutralino.filesystem.writeFile("tests/output/benchmark.json",JSON.stringify(o,null,2))}M().then(()=>console.log("Tests completed."));})();

addEventListener("error", (e)=>alert(e.message));
let canvas=document.getElementById("canvas");
canvas.width=100;
canvas.height=100;
let ctx=canvas.getContext("2d");
let select=document.getElementById("typeSelect");
let fileName="";
let history=new Array();
let eyeDropperColor="#000000";
function handleFile(e) {
    if (!e.target.files.length) return false;
    let reader=new FileReader();
    reader.onload=()=>{
        document.getElementById("img").src=reader.result;
        document.getElementById("img").onload=()=>{
            canvas.width=document.getElementById("img").getBoundingClientRect().width;
            canvas.height=document.getElementById("img").getBoundingClientRect().height;
            document.getElementById("canvasWidth").value=canvas.width;
            document.getElementById("canvasHeight").value=canvas.height;
            ctx.drawImage(document.getElementById("img"), 0, 0);
        };
    };
    reader.readAsDataURL(e.target.files[0]);
    fileName=e.target.files[0].name;
};
function hexToRgb(hex) {
    hex=hex.split("#").join("");
    return {
        r: Number.parseInt(`0x${hex.slice(0, 2)}`, 16),
        g: Number.parseInt(`0x${hex.slice(2, 4)}`, 16),
        b: Number.parseInt(`0x${hex.slice(4, 6)}`, 16)
    };
};
function download() {
    let a=document.createElement("a");
    a.href=canvas.toDataURL(`image/${select.options[select.selectedIndex].value}`);
    a.download=`${fileName.split(".")[0]}.${select.options[select.selectedIndex].value}`;
    document.body.appendChild(a);
    a.click();
};
function grayscale() {
    history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    let imageData=ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i=0; i<imageData.data.length; i+=4) {
        let colors={
            r: imageData.data[i]/255,
            g: imageData.data[i+1]/255,
            b: imageData.data[i+2]/255
        };
        let rgb=hsvToRgb(0, 0, (colors.r*.299)+(colors.g*.587)+(colors.b*.114));
        imageData.data[i]=rgb[0];
        imageData.data[i+1]=rgb[1];
        imageData.data[i+2]=rgb[2];
    };
    ctx.putImageData(imageData, 0, 0);
    document.getElementById("img").src=canvas.toDataURL("image/png");
};
function invert() {
    history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    let imageData=ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i=0; i<imageData.data.length; i+=4) {
        imageData.data[i]=255-imageData.data[i];
        imageData.data[i+1]=255-imageData.data[i+1];
        imageData.data[i+2]=255-imageData.data[i+2];
    };
    ctx.putImageData(imageData, 0, 0);
    document.getElementById("img").src=canvas.toDataURL("image/png");
};
function flipX() {
    history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    ctx.save();
    ctx.translate(document.getElementById("img").width, 0);
    ctx.scale(-1, 1);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(document.getElementById("img"), 0, 0, canvas.width, canvas.height);
    ctx.restore();
    document.getElementById("img").src=canvas.toDataURL("image/png");
};
function flipY() {
    history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    ctx.save();
    ctx.translate(0, document.getElementById("img").height);
    ctx.scale(1, -1);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(document.getElementById("img"), 0, 0, canvas.width, canvas.height);
    ctx.restore();
    document.getElementById("img").src=canvas.toDataURL("image/png");
};
function removeReds() {
	history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    let imageData=ctx.getImageData(0, 0, canvas.width, canvas.height);
	for (let i=0; i<imageData.data.length; i+=4) {
        imageData.data[i]=0;
	};
    ctx.putImageData(imageData, 0, 0);
	document.getElementById("img").src=canvas.toDataURL("image/png");
};
function removeGreens() {
	history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
	let imageData=ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i=0; i<imageData.data.length; i+=4) {
        imageData.data[i+1]=0;
    };
    ctx.putImageData(imageData, 0, 0);
    document.getElementById("img").src=canvas.toDataURL("image/png");
};
function removeBlues() {
	history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    let imageData=ctx.getImageData(0, 0, canvas.width, canvas.height);
	for (let i=0; i<imageData.data.length; i+=4) {
        imageData.data[i+2]=0;
	};
    ctx.putImageData(imageData, 0, 0);
	document.getElementById("img").src=canvas.toDataURL("image/png");
};
function undo() {
	if (!history.length) return false;
	if (history[history.length-1]?.isResizeEntry) {
        let entry=history.pop();
		canvas.width=entry.width;
        canvas.height=entry.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.putImageData(entry.data, 0, 0);
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.putImageData(history.pop(), 0, 0);
    };
    document.getElementById("img").src=canvas.toDataURL("image/png");
};
function addRgb() {
    history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    let imageData=ctx.getImageData(0, 0, canvas.width, canvas.height);
    let add={
        r: parseFloat(document.getElementById("redAdd").value),
        g: parseFloat(document.getElementById("greenAdd").value),
        b: parseFloat(document.getElementById("blueAdd").value)
    };
    for (let i=0; i<imageData.data.length; i+=4) {
        imageData.data[i]=Math.max(Math.min(imageData.data[i]+add.r, 255), 0);
        imageData.data[i+1]=Math.max(Math.min(imageData.data[i+1]+add.g, 255), 0);
        imageData.data[i+2]=Math.max(Math.min(imageData.data[i+2]+add.b, 255), 0);
    };
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(imageData, 0, 0);
    document.getElementById("img").src=canvas.toDataURL("image/png");
};
function multiplyRgb() {
    history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    let imageData=ctx.getImageData(0, 0, canvas.width, canvas.height);
    let multipliers={
        r: parseFloat(document.getElementById("redMultiplier").value),
        g: parseFloat(document.getElementById("greenMultiplier").value),
        b: parseFloat(document.getElementById("blueMultiplier").value)
    };
    for (let i=0; i<imageData.data.length; i+=4) {
        imageData.data[i]=Math.min(Math.floor(imageData.data[i]*multipliers.r), 255);
        imageData.data[i+1]=Math.min(Math.floor(imageData.data[i+1]*multipliers.g), 255);
        imageData.data[i+2]=Math.min(Math.floor(imageData.data[i+2]*multipliers.b), 255);
    };
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(imageData, 0, 0);
    document.getElementById("img").src=canvas.toDataURL("image/png");
};
function inputFix() {
    document.getElementById("redAdd").value=Math.max(Math.min(document.getElementById("redAdd").value, 255), -255);
    document.getElementById("greenAdd").value=Math.max(Math.min(document.getElementById("greenAdd").value, 255), -255);
    document.getElementById("blueAdd").value=Math.max(Math.min(document.getElementById("blueAdd").value, 255), -255);
    document.getElementById("noiseSeed").value=Math.max(Math.min(document.getElementById("noiseSeed").value, 1), 0);
    document.getElementById("darkenBrighten").value=Math.max(Math.min(document.getElementById("darkenBrighten").value, 1), 0);
    document.getElementById("canvasWidth").value=Math.floor(Math.max(document.getElementById("canvasWidth").value, 1));
    document.getElementById("canvasHeight").value=Math.floor(Math.max(document.getElementById("canvasHeight").value, 1));
};
function openEyeDropper() {
    (new EyeDropper()).open().then(res=>{
        let rgb=hexToRgb(res.sRGBHex);
        let hsl=rgbToHsl(rgb.r, rgb.g, rgb.b);
        let rgbString=`rgb(${rgb.r},${rgb.g},${rgb.b})`;
        let hslString=`hsl(${(hsl[0]*100).toFixed(2)}%, ${(hsl[1]*100).toFixed(2)}%, ${(hsl[2]*100).toFixed(2)}%)`;
        let invertedRgbString=`rgb(${255-rgb.r},${255-rgb.g},${255-rgb.b})`;
        eyeDropperColor=res.sRGBHex;
        document.getElementById("eyeDropperColor").innerHTML=`${res.sRGBHex} ${rgbString} ${hslString}`;
        document.getElementById("eyeDropperColor").style["color"]=res.sRGBHex;
        document.getElementById("eyeDropperColor").style["background-color"]=invertedRgbString;
    });
};
function perlinNoise() {
    if (!canvas.width) {
        canvas.width=100;
        canvas.height=100;
    };
    history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    let imageData=ctx.getImageData(0, 0, canvas.width, canvas.height);
    imageData.data=imageData.data.map(i=>255);
    noise.seed(parseFloat(document.getElementById("noiseSeed").value));
    for (let x=0; x<canvas.width; x++) {
        for (let y=0; y<canvas.height; y++) {
            let pixel=(x+y*canvas.width)*4;
            imageData.data[pixel]=imageData.data[pixel+1]=imageData.data[pixel+2]=Math.abs(noise.perlin2(x/100, y/100)*256);
            imageData.data[pixel+3]=255;
        };
    };
    ctx.putImageData(imageData, 0, 0);
    document.getElementById("img").src=canvas.toDataURL("image/png");
};
function generateSolid() {
    history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    let imageData=ctx.getImageData(0, 0, canvas.width, canvas.height);
	let rgb=hexToRgb(document.getElementById("solidColor").value);
    for (let i=0; i<imageData.data.length; i+=4) {
    	imageData.data[i]=rgb.r;
        imageData.data[i+1]=rgb.g;
	    imageData.data[i+2]=rgb.b;
        imageData.data[i+3]=255;
    };
    ctx.putImageData(imageData, 0, 0);
    document.getElementById("img").src=canvas.toDataURL("image/png");
};
function makeGradient() {
    history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    ctx.save();
    let gradient=ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, document.getElementById("gradientColor1").value);
    gradient.addColorStop(1, document.getElementById("gradientColor2").value);
    ctx.fillStyle=gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    document.getElementById("img").src=canvas.toDataURL("image/png");
};
function replace() {
    history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    let imageData=ctx.getImageData(0, 0, canvas.width, canvas.height);
    let rgb=hexToRgb(document.getElementById("solidColor").value);
    for (let i=0; i<imageData.data.length; i+=4) {
        imageData.data[i]=rgb.r;
        imageData.data[i+1]=rgb.g;
        imageData.data[i+2]=rgb.b;
    };
    ctx.putImageData(imageData, 0, 0);
    document.getElementById("img").src=canvas.toDataURL("image/png");
};
function darken() {
    history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    let imageData=ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i=0; i<imageData.data.length; i+=4) {
        let rgb={
            r: imageData.data[i],
            g: imageData.data[i+1],
			b: imageData.data[i+2]
        };
        let hsl=rgbToHsl(rgb.r, rgb.g, rgb.b);
        hsl[2]-=parseFloat(document.getElementById("darkenBrighten").value);
        rgb=hslToRgb(hsl[0], hsl[1], hsl[2]);
        imageData.data[i]=rgb[0];
        imageData.data[i+1]=rgb[1];
        imageData.data[i+2]=rgb[2];
    };
    ctx.putImageData(imageData, 0, 0);
    document.getElementById("img").src=canvas.toDataURL("image/png");
};
function brighten() {
    history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    let imageData=ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i=0; i<imageData.data.length; i+=4) {
        let rgb={
            r: imageData.data[i],
            g: imageData.data[i+1],
            b: imageData.data[i+2]
        };
        let hsl=rgbToHsl(rgb.r, rgb.g, rgb.b);
        hsl[2]+=parseFloat(document.getElementById("darkenBrighten").value);
        rgb=hslToRgb(hsl[0], hsl[1], hsl[2]);
        imageData.data[i]=rgb[0];
        imageData.data[i+1]=rgb[1];
        imageData.data[i+2]=rgb[2];
    };
    ctx.putImageData(imageData, 0, 0);
    document.getElementById("img").src=canvas.toDataURL("image/png");
};
function setCanvasSize() {
    history.push({
        width: canvas.width,
        height: canvas.height,
        data: ctx.getImageData(0, 0, canvas.width, canvas.height),
        isResizeEntry: true
    });
    canvas.width=parseInt(document.getElementById("canvasWidth").value);
    canvas.height=parseInt(document.getElementById("canvasHeight").value);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(history[history.length-1].data, 0, 0);
    document.getElementById("img").src=canvas.toDataURL("image/png");
};
function hueRotate() {
    history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    let imageData=ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i=0; i<imageData.data.length; i+=4) {
        let rgb={
            r: imageData.data[i],
            g: imageData.data[i+1],
            b: imageData.data[i+2]
        };
        let hsl=rgbToHsl(rgb.r, rgb.g, rgb.b);
        hsl[0]+=parseFloat(document.getElementById("hueRotate").value)/360;
        rgb=hslToRgb(hsl[0], hsl[1], hsl[2]);
        imageData.data[i]=rgb[0];
        imageData.data[i+1]=rgb[1];
        imageData.data[i+2]=rgb[2];
    };
    ctx.putImageData(imageData, 0, 0);
    document.getElementById("img").src=canvas.toDataURL("image/png");
};
function pickerClick(e) {
    if (e.ctrlKey) {
        e.target.value=eyeDropperColor;
        e.preventDefault();
    };
};
let buttonMap=[
    {
        id: "download",
        callback: download
    },
    {
        id: "invert",
        callback: invert
    },
    {
        id: "grayscale",
        callback: grayscale
    },
    {
        id: "flipX",
        callback: flipX
    },
    {
        id: "flipY",
        callback: flipY
    },
    {
        id: "undo",
        callback: undo
    },
    {
        id: "removeReds",
        callback: removeReds
    },
    {
        id: "removeGreens",
        callback: removeGreens
    },
    {
        id: "removeBlues",
        callback: removeBlues
    },
    {
        id: "addRgb",
        callback: addRgb
    },
    {
        id: "multiplyRgb",
        callback: multiplyRgb
    },
    {
        id: "openEyeDropper",
        callback: openEyeDropper
    },
    {
        id: "perlinNoise",
        callback: perlinNoise
    },
    {
        id: "solid",
        callback: generateSolid
    },
    {
        id: "replace",
        callback: replace
    },
    {
        id: "setCanvasSize",
        callback: setCanvasSize
    },
    {
        id: "gradient",
        callback: makeGradient
    },
    {
        id: "brighten",
        callback: brighten
    },
    {
        id: "darken",
        callback: darken
    },
    {
        id: "rotate",
        callback: hueRotate
    }
];
buttonMap.forEach(m=>{
    document.getElementById(m.id).addEventListener("mousedown", m.callback);
});
document.querySelectorAll("input").forEach(i=>i.addEventListener("change", inputFix));
document.querySelectorAll("button").forEach(i=>i.addEventListener("change", inputFix));
document.querySelectorAll('input[type="color"]').forEach(i=>i.addEventListener("mousedown", pickerClick));
document.getElementById("upload").addEventListener("change", handleFile);

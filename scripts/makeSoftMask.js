import { createCanvas } from "canvas";
import fs from "fs";

const width = 512;
const height = 512;

const canvas = createCanvas(width, height);
const ctx = canvas.getContext("2d");

// Create horizontal grayscale gradient: black (left) → white (right)
const gradient = ctx.createLinearGradient(0, 0, width, 0);
gradient.addColorStop(0.0, "black");
gradient.addColorStop(1.0, "white");

ctx.fillStyle = gradient;
ctx.fillRect(0, 0, width, height);

const buffer = canvas.toBuffer("image/png");
fs.writeFileSync("tests/fixtures/softmask.png", buffer);

console.log("Softmask written to tests/fixtures/softmask.png");

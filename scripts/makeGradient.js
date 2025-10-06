import { createCanvas } from "canvas";
import fs from "fs";

const width = 512;
const height = 512;

const canvas = createCanvas(width, height);
const ctx = canvas.getContext("2d");

// Horizontal gradient: black -> red -> green -> blue -> white
const gradient = ctx.createLinearGradient(0, 0, width, 0);
gradient.addColorStop(0.0, "black");
gradient.addColorStop(0.25, "red");
gradient.addColorStop(0.5, "green");
gradient.addColorStop(0.75, "blue");
gradient.addColorStop(1.0, "white");

ctx.fillStyle = gradient;
ctx.fillRect(0, 0, width, height);

const buffer = canvas.toBuffer("image/png");
fs.writeFileSync("tests/fixtures/gradient.png", buffer);

console.log("Gradient written to tests/fixtures/gradient.png");

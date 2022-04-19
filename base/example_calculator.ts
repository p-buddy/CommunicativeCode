import ask from "./ask";
import { after } from "./events";

type TCalculator = {
  manufactuer: string;
  model: string;
  multiply: (a: number, b: number) => number;
  divideWithRemainder: (dividend: number, divisor: number) => [quotient: number, remainder: number];
}

const ti84: TCalculator = {
  manufactuer: "Texas Instruments",
  model: "TI-84",
  multiply: (a, b) => a * b,
  divideWithRemainder: (n, d) => [Math.floor(n / d), n % d],
}

const badCalculator: TCalculator = {
  manufactuer: "Cheapo Inc.",
  model: "Errorer",
  multiply: (a, b) => a / b,
  divideWithRemainder: (n, d) => [Math.floor(n * d), n % d],
}

after(ti84, "multiply").finally((result) => {
  console.log("here's your answer! ", result);
});

ask(ti84).to("multiply", 3, 5);
ask(ti84).to("divideWithRemainder", 16, 3);
ask(ti84).whatIsIts("manufactuer");
ask(ti84).whatIsIts("model");

after(badCalculator, "multiply").finally((result, a, b) => {
  const correctAnswer = ti84.multiply(a, b);
  console.log("cheapo vs ti", result, correctAnswer);
})

ask(badCalculator).to("multiply", 4, 5);

// 'real' programming
ti84.multiply(3, 3);

// instructive programming
ask(ti84).to("multiply", 4, 5);

after(ti84, "multiply").finally((result) => {

});
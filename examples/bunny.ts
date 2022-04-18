import ask from "../ask";

const bunny = {
  position: 0,
  name: "Peter",
  teleport: function (distance: number) {
    this.position += distance;
  },
  hop: async function (distance: number): Promise<number> {
    const final = this.position + distance;
    const direction = Math.sign(distance);
    const stepSize = 1;
    const step = direction * stepSize;
    const delayMs = 100;

    while (this.position != final) {
      this.position += step;
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    return this.position;
  },
  sayHelloTo: function (person: string) {
    console.log(`Hello, ${person}! My name is ${this.name}`);
  }
};

ask(bunny).to("sayHelloTo", "Parker");
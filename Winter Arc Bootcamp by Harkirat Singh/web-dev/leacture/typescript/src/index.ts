function greet(name: string) {
  console.log(`hello, ${name}`);
}
greet("Sakshi");

function sum(a: number, b: number): number {
  return a + b;
}
console.log(sum(1, 2));

function isLegal(age: number) {
  return age > 18 ? true : false;
}

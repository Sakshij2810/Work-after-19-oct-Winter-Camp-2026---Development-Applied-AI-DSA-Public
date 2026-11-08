class Shape {
  constructor(color, volume) {
    this.color = color;
    this.volume = volume;
  }

  static staticFunction() {
    console.log(
      "this is directly called static function, no need of creating instance of class to call it",
    );
  }

  area() {
    throw new Error("This area method must be implemented in subclass");
  }

  calcVolume() {
    return this.area() * this.volume;
  }

  paint() {
    console.log(`color of the shape is : ${this.color}`);
  }
}

class Rectangle extends Shape {
  constructor(width, lenght, volume, color) {
    super(color, volume);
    this.width = width;
    this.lenght = lenght;
  }

  area() {
    return this.lenght * this.width;
  }

  perimeter() {
    return 2 * (this.lenght + this.width);
  }
}

class Square extends Shape {
  constructor(side, volume, color) {
    super(color, volume);
    this.side = side;
  }

  area() {
    return this.side * this.side;
  }

  perimeter() {
    return 4 * this.side;
  }
}

class Circle extends Shape {
  constructor(radius, volume, color) {
    super(color, volume);
    this.radius = radius;
  }

  area() {
    return 3.14 * this.radius * this.radius;
  }

  perimeter() {
    return 2 * 3.14 * this.radius;
  }
}

//------------------------ non-static functions

// let r1 = new Rectangle(10, 20, 3, "red");
// let s1 = new Square(40, 4, "yellow");
// let c1 = new Circle(20, 2, "purple");

// console.log(r1.area());
// console.log(s1.perimeter());
// c1.paint();
// console.log(r1.calcVolume());

//------------------------ static function
Rectangle.staticFunction();

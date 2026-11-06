
const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "fitzy-demo-secret",
    resave: false,
    saveUninitialized: true
  })
);

// Size options for each category
const sizeOptions = {
  Tops: ["XS", "S", "M", "L", "XL", "XXL"],
  Jackets: ["XS", "S", "M", "L", "XL", "XXL"],
  Bottomwear: ["26", "28", "30", "32", "34", "36"],
  Footwear: ["36", "37", "38", "39", "40", "41"]
};

// FITZY products
const products = [
  { id: 1, name: "Blue Top", category: "Tops", price: 799, image: "/images/blue top.jpg" },
  { id: 2, name: "White Top", category: "Tops", price: 699, image: "/images/white top.jpg" },
  { id: 3, name: "Slay Top", category: "Tops", price: 899, image: "/images/slay top.jpg" },
  { id: 4, name: "Boss Top", category: "Tops", price: 999, image: "/images/boss top.jpg" },
  { id: 5, name: "Boots", category: "Footwear", price: 1499, image: "/images/boots.jpg" },
  { id: 6, name: "Heels", category: "Footwear", price: 1199, image: "/images/heels.jpg" },
  { id: 7, name: "Casual Shoes", category: "Footwear", price: 1299, image: "/images/casual shoes.jpg" },
  { id: 8, name: "Tiger Sneakers", category: "Footwear", price: 1599, image: "/images/tiger.jpg" },
  { id: 9, name: "Midi Skirt", category: "Bottomwear", price: 999, image: "/images/midi skirt.jpg" },
  { id: 10, name: "Jeans", category: "Bottomwear", price: 1399, image: "/images/jeans.jpg" },
  { id: 11, name: "Mini Skirt", category: "Bottomwear", price: 899, image: "/images/mini skirt.jpg" },
  { id: 12, name: "Trendy Jeans", category: "Bottomwear", price: 1499, image: "/images/trendy jeans.jpg" },
  { id: 13, name: "Leather Jacket", category: "Jackets", price: 2499, image: "/images/leather jacket.jpg" },
  { id: 14, name: "Denim Jacket", category: "Jackets", price: 1799, image: "/images/denim jacket.jpg" },
  { id: 15, name: "Zara Jacket", category: "Jackets", price: 1999, image: "/images/zara.jpg" },
  { id: 16, name: "Black Jacket", category: "Jackets", price: 2299, image: "/images/add jacket.jpg" }
];

// Attach sizes to every product
products.forEach((product) => {
  product.sizes = sizeOptions[product.category];
});

const categories = ["Tops", "Footwear", "Bottomwear", "Jackets"];

// Make cart count available on every page
app.use((req, res, next) => {
  const cart = req.session.cart || [];

  res.locals.cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  next();
});

// Helper functions
function money(amount) {
  return "₹" + amount.toLocaleString("en-IN");
}

function getCart(req) {
  const cart = req.session.cart || [];

  return cart
    .map((row) => {
      const product = products.find(
        (p) => p.id === row.productId
      );

      if (!product) return null;

      return {
        ...product,
        size: row.size,
        quantity: row.quantity,
        subtotal: product.price * row.quantity
      };
    })
    .filter(Boolean);
}

// Home page and category filters
app.get("/", (req, res) => {
  const selectedCategory = req.query.category || "All";

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter(
          (p) => p.category === selectedCategory
        );

  res.render("index", {
    products: filteredProducts,
    categories,
    money,
    selectedCategory
  });
});

// Product details
app.get("/product/:id", (req, res) => {
  const product = products.find(
    (p) => p.id === Number(req.params.id)
  );

  if (!product) {
    return res.status(404).send("Product not found");
  }

  res.render("product", {
    product,
    money
  });
});

// Add product and selected size to cart
app.post("/cart/add/:id", (req, res) => {
  const product = products.find(
    (p) => p.id === Number(req.params.id)
  );

  if (!product) {
    return res.status(404).send("Product not found");
  }

  const selectedSize = req.body.size;

  if (!product.sizes.includes(selectedSize)) {
    return res.status(400).send("Please select a valid size.");
  }

  if (!req.session.cart) {
    req.session.cart = [];
  }

  const existingItem = req.session.cart.find(
    (item) =>
      item.productId === product.id &&
      item.size === selectedSize
  );

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    req.session.cart.push({
      productId: product.id,
      size: selectedSize,
      quantity: 1
    });
  }

  res.redirect("/cart");
});

// Cart page
app.get("/cart", (req, res) => {
  const cart = getCart(req);

  const total = cart.reduce(
    (sum, item) => sum + item.subtotal,
    0
  );

  res.render("cart", {
    cart,
    total,
    money
  });
});

// Remove a particular product and size from cart
app.post("/cart/remove/:id", (req, res) => {
  const productId = Number(req.params.id);
  const selectedSize = req.body.size;

  req.session.cart = (req.session.cart || []).filter(
    (item) =>
      !(item.productId === productId && item.size === selectedSize)
  );

  res.redirect("/cart");
});

// Checkout page
app.get("/checkout", (req, res) => {
  const cart = getCart(req);

  if (!cart.length) {
    return res.redirect("/cart");
  }

  const total = cart.reduce(
    (sum, item) => sum + item.subtotal,
    0
  );

  res.render("checkout", {
    cart,
    total,
    money
  });
});

// Place order
app.post("/checkout", (req, res) => {
  const { name, email, address } = req.body;
  const cart = getCart(req);

  const total = cart.reduce(
    (sum, item) => sum + item.subtotal,
    0
  );

  if (!cart.length) {
    return res.redirect("/cart");
  }

  if (
    !name?.trim() ||
    !email?.trim() ||
    !address?.trim() ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    return res.status(400).render("checkout", {
      cart,
      total,
      money,
      error: "Please enter your name, a valid email and delivery address."
    });
  }

  const orderId = "FITZY-" + Date.now();

  // Clear the cart after placing the order
  req.session.cart = [];

  // Show website confirmation only. No email is sent.
  res.render("success", {
    name: name.trim(),
    orderId
  });
});

// Start website
app.listen(PORT, () => {
  console.log(`FITZY running at http://localhost:${PORT}`);
});

# UrbanCart

A demo eCommerce website built with Node.js, Express, EJS and session-based cart storage.

## Categories
- Tops
- Footwear
- Bottomwear
- Jackets

The old sample products have been cleared so you can add your own catalogue.

## Add your own products
1. Put the product image inside `public/images/`.
2. Open `server.js`.
3. Add a product object inside the `products` array. Example:

```js
{
  id: 1,
  name: "Navy One-Shoulder Top",
  category: "Tops",
  price: 799,
  image: "/images/navy-one-shoulder-top.jpg"
}
```

Use a unique number for each `id`. The category must be exactly `Tops`, `Footwear`, `Bottomwear`, or `Jackets`. The image filename and extension must match the real file.

## Run
1. Open a terminal inside this folder.
2. Run `npm install`.
3. Run `npm start`.
4. Open http://localhost:3000.

This is a learning project. Checkout is a demo and does not process real payments or save orders to a database.

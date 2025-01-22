# Express Async Errors Handling

## 1. Create an AppError Class

We made a class `AppError` with a parameterized constructor with arguments of `status` and `message`. We extend this class from the built-in class `Error`:

```javascript
class AppError extends Error {
    constructor(status, message) {
        super();
        this.message = message;
        this.status = status;
    }
}

module.exports = AppError;
```

## 2. Create an Error Handling Middleware

Make a middleware to handle errors:

```javascript
app.use((err, req, res, next) => {
    const { status = 500, message = 'Something went wrong' } = err; // default status and message
    res.status(status).send(message);
});
```

## 3. Throw an Error if a Product is Not Found

If a product is not found, throw an error:

```javascript
app.get('/products/:id', async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
        return next(new AppError(404, 'Product not found')); // if we just throw the error it won't go to the next middleware, i.e., our error middleware and no error will be thrown
    }
    res.render('products/show', { product });
});
```

For errors returned from asynchronous functions invoked by route handlers and middleware, you must pass them to the `next()` function, where Express will catch and process them. Async functions need a `next` argument and you pass in the error to `next` in the route handler, so that it can call the error handling middleware.

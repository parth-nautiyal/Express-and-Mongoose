const express = require('express')
const app = express()
const path = require('path')
const Product = require('./models/product.js')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const AppError = require('./AppError')



app.use(methodOverride('_method'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'ejs')

const mongoose = require('mongoose')
main().catch(err => console.log(err))

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/farmStand2');
}

const categories = ['fruit', 'vegetable', 'dairy']

app.get('/products/:id/edit', async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    res.render('products/edit', { product, categories });
});

app.put('/products/:id', async (req, res) => {
    const { id } = req.params
    const product = await Product.findByIdAndUpdate(id, req.body, { runValidators: true }, { new: true })
    res.redirect(`/products/${product._id}`)
})

app.get('/products/new', (req, res) => {
    res.render('products/new', { categories })
})
app
    .get('/products', async (req, res) => {
        const { category } = req.query;
        if (category) {
            const products = await Product.find({ category })
            res.render('products/home', { products, category })
        } else {
            const products = await Product.find({})
            res.render('products/home', { products, category: 'All' })
        }
    })

app.get('/products/:id', async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id)
    if (!product) {
        return next(new AppError(404,'Product not found'))
    }
    res.render('products/show', { product })
})

app.post('/products', async (req, res) => {
    const newProduct = new Product(req.body)
    await newProduct.save()
    res.redirect(`/products/${newProduct._id}`)
})

app.delete('/products/:id', async (req, res) => {
    const { id } = req.params
    const product = await Product.findByIdAndDelete(id)
    res.redirect('/products')
})

app.use((err, req, res, next) => {
    const { status = 500, message = 'Something went wrong' } = err
    res.status(status).send(message)
})

app.listen(3000, () => {
    console.log("Connection Express at port 3000!!!")
})
const express = require('express')
const app = express()
const path = require('path')
const Product = require('./models/product.js')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const AppError = require('./AppError')
const Farm = require('./models/farms')

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

app.get('/farms', async(req, res) => {
    const farms = await Farm.find({})
    res.render('farms/home', { farms })
})
app.get('/farms/new', (req, res) => {
    res.render('farms/new')
})
app.get('/farms/:id', async(req, res) => {
    const farm = await Farm.findById(req.params.id).populate('products')
    res.render('farms/show', { farm })
})
app.post('/farms', async(req, res) => {
    const farm = new Farm(req.body)
    await farm.save()
    res.redirect('/farms')
})
app.delete('/farms/:id', async(req, res) => {
    const farm = await Farm.findByIdAndDelete(req.params.id)
    res.redirect('/farms')
})
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

app.get('/farms/:id/products/new', (req, res) => {
    res.render('products/new', { categories, id: req.params.id })
})
app.post('/farms/:id/products', async(req, res) => {
    const { id } = req.params
    const farm = await Farm.findById(id)
    const { name, price, category } = req.body
    const product = new Product({ name, price, category })
    farm.products.push(product)
    product.farm = farm
    await farm.save()
    await product.save()
    res.redirect(`/farms/${id}`)
})

app.get('/products', async (req, res) => {
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
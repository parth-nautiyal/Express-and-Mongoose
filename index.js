const express = require('express')
const app = express()
const path= require('path')
const Product = require('./models/product.js')
const bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.set('views',path.join(__dirname,'/views'))
app.set('view engine','ejs')

const mongoose = require('mongoose')
main().catch(err => console.log(err))

async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/farmStand');
}
app.get('/products/new',(req,res)=>{
    res.render('products/new')
})
app.get('/products', async (req,res)=>{
    const products = await Product.find({})
    res.render('products/home',{products})
})
app.get('/products/:id',async (req,res)=>{
    const {id} = req.params;
    const product = await Product.findById(id)
    res.render('products/show',{product})
})
app.post('/products',async (req,res)=>{
    const newProduct = new Product(req.body)
    await newProduct.save()
    res.redirect(`/products/${newProduct._id}`)
})
app.listen(3000, ()=>{
    console.log("Connection Express at port 3000!!!")
})
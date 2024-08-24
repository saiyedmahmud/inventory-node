const {PrismaClient} = require('@prisma/client') 
const prisma = new PrismaClient()
const express = require('express')
const morgan = require('morgan')
const app = express()

app.use(morgan('dev'))
app.use(express.json())


///////////////////////////////////SUPPLIER/////////////////////////////////////
app.post('/supplier', async (req, res)=>{
 
   try{
    const {name, phone} = req.body

    const supplier = await prisma.supplier.create({
        data: {
            name,
            phone
        }
    });
        return res.status(201).json({message: 'Supplier created', supplier})
   }catch(error){
       console.log(error)
        return res.status(400).json({error: 'Something went wrong'})
   }
})

app.get('/supplier', async (req, res)=>{
    try{
        const suppliers = await prisma.supplier.findMany()

        suppliers.forEach(supplier => {
            supplier.purchaseInvoices = []
        }
        )
       return res.status(200).json(suppliers)
    }catch(e){
        console.log(e)
       return res.status(500).json({error: 'Something went wrong'})
    }
}
)

app.get('/supplier/:id', async (req, res)=>{

    try{
        const {id} = req.params
        const supplier = await prisma.supplier.findUnique({
            where: {
                id: Number(id)
            }
        })

        if(!supplier){
            return res.status(404).json({error: 'Supplier not found'})
        }

       if(supplier.purchaseInvoices){
           supplier.forEach(purchaseInvoice => {
                purchaseInvoice.supplier = {}
              })
         }

        res.status(200).json(supplier)

    }catch(e){
        console.log(e)
        res.status(500).json({error: 'Something went wrong'})
    }
}
)

app.put('/supplier/:id', async (req, res)=>{
    try{
        const {id} = req.params
        const {name, phone} = req.body
        const supplier = await prisma.supplier.findFirst({
            where: {
                id: parseInt(id)
            }
        })
        if(!supplier){
            return res.status(404).json({error: 'Supplier not found'})
        }

        await prisma.supplier.update({
            where: {
                id: parseInt(id)
            },
            data: {
                name: name || supplier.name,
                phone: phone || supplier.phone
            }
        })

        res.status(200).json({message: 'Supplier updated'})
    }catch(e){
        console.log(e)
        res.status(500).json({error: 'Something went wrong'})
    }
}
)


app.patch('/supplier/:id', async (req, res)=>{
    try{
        const {id} = req.params
        const {status} = req.body

        const supplier = await prisma.supplier.findFirst({
            where: {
                id: parseInt(id)
            }
        })

        if(!supplier){
            return res.status(404).json({error: 'Supplier not found'})
        }

        await prisma.supplier.update({
            where: {
                id: parseInt(id)
            },
            data: {
                status: status || supplier.status
            }
        })

        res.status(200).json({message: 'Supplier status updated', supplier})
    }catch(e){
        console.log(e)
        res.status(500).json({error: 'Something went wrong'})
    }
})



///////////////////////////////////PRODUCT/////////////////////////////////////

app.post('/product', async (req, res)=>{
 
    try{
     const {name, purchasePrice, sellingPrice, quantity} = req.body
 
     const product = await prisma.product.create({
         data: {
             name,
         }
     });
         return res.status(201).json({message: 'Product created', product})
    }catch(error){
        console.log(error)
         return res.status(400).json({error: 'Something went wrong'})
    }
 })


 app.get('/product', async (req, res)=>{
    try{
        const products = await prisma.product.findMany()
        res.status(200).json(products)
    }catch(e){
        console.log(e)
        res.status(500).json({error: 'Something went wrong'})
    }

 })

    app.get('/product/:id', async (req, res)=>{

        try{
            const {id} = req.params
            const product = await prisma.product.findUnique({
                where: {
                    id: parseInt(id)
                }
            })
    
            if(!product){
                return res.status(404).json({error: 'Product not found'})
            }
    
            res.status(200).json(product)
    
        }catch(e){
            console.log(e)
            res.status(500).json({error: 'Something went wrong'})
        }
    })

    app.put('/product/:id', async (req, res)=>{
        try{
            const {id} = req.params
            const {name, purchasePrice, sellingPrice, quantity} = req.body
    
            const product = await prisma.product.findFirst({
                where: {
                    id: parseInt(id)
                }
            })
    
            if(!product){
                return res.status(404).json({error: 'Product not found'})
            }
    
            await prisma.product.update({
                where: {
                    id: parseInt(id)
                },
                data: {
                    name: name || product.name,
                    purchasePrice: purchasePrice || product.purchasePrice,
                    sellingPrice: sellingPrice || product.sellingPrice,
                    quantity: quantity || product.quantity
                }
            })
    
            res.status(200).json({message: 'Product updated', product})
        }catch(e){
            console.log(e)
            res.status(500).json({error: 'Something went wrong'})
        }
    })


    app.patch('/product/:id', async (req, res)=>{
        try{
            const {id} = req.params
            const {status} = req.body
    
            const product = await prisma.product.findFirst({
                where: {
                    id: parseInt(id)
                }
            })
    
            if(!product){
                return res.status(404).json({error: 'Product not found'})
            }
    
            await prisma.product.update({
                where: {
                    id: parseInt(id)
                },
                data: {
                    status: status || product.status
                }
            })
    
            res.status(200).json({message: 'Product status updated', product})
        }catch(e){
            console.log(e)
            res.status(500).json({error: 'Something went wrong'})
        }
    })

///////////////////////////////////PURCHASE INVOICE/////////////////////////////////////

app.post('/purchaseInvoice', async (req, res)=>{
 
    try {
        const { supplierId, products } = req.body;
    
        let totalAmountPurchase = 0;
    
        const productUpdates = products.map(async (product) => {
            const { productId, purchasePrice, sellingPrice, quantity } = product;
            const singleProduct = await prisma.product.findUnique({
                where: {
                    id: productId
                }
            });
            if (!singleProduct) {
                throw new Error('Product not found');
            }
            totalAmountPurchase += parseInt(purchasePrice) * parseInt(quantity);
            await prisma.product.update({
                where: {
                    id: productId
                },
                data: {
                    quantity: singleProduct.quantity + quantity,
                    purchasePrice: purchasePrice,
                    sellingPrice: sellingPrice
                }
            });
        });
    
        await Promise.all(productUpdates);
    
        const purchaseInvoice = await prisma.purchaseInvoice.create({
            data: {
                supplierId,
                totalAmount: totalAmountPurchase
            }
        });

        const invoiceItems = products.map(async (product) => {
            const { productId} = product;
            await prisma.purchaseInvoiceProduct.create({
                data: {
                    purchaseInvoiceId: purchaseInvoice.id,
                    productId,
                }
            });
        });
    
        res.status(201).json(purchaseInvoice);
    }catch(error){
        console.log(error)
         return res.status(400).json({error: 'Something went wrong'})
    }
 })

 app.get('/purchaseInvoice', async (req, res)=>{
    try{
        const purchaseInvoices = await prisma.purchaseInvoice.findMany({
            include: {
                supplier: true,
                invoiceItems: {
                    include: {
                        product: true
                    }
                }
            }
        })

        res.status(200).json(purchaseInvoices)
    }catch(e){
        console.log(e)
        res.status(500).json({error: 'Something went wrong'})
    }

 })



























const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
    }
)





const {PrismaClient} = require('@prisma/client') 
const prisma = new PrismaClient()
const express = require('express')
const morgan = require('morgan')
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const compression = require("compression");
const app = express()
const cors = require("cors");


const http = require('http');

const hostname = '0.0.0.0';
const port = 8000;

app.use(morgan('dev'))
app.use(express.json())

let allowedOrigins = [
    "http://191.168.68.119:5173",
    'http://localhost:5173',
  ];
  
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 2000, // Limit each IP to 20 requests per `window` (here, per 15 minutes)
    standardHeaders: false, // Disable rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });
  
  app.use(compression());
  app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
  app.use(morgan("dev"));
  app.use(
    cors({
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
          let msg =
            "The CORS policy for this site does not " +
            "allow access from the specified Origin.";
          return callback(new Error(msg), false);
        }
        return callback(null, true);
      },
    })
  );
  
app.use(express.json({ extended: true }));

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


 /////////////////////////////////////Language/////////////////////////////////////

            app.post('/language', async (req, res)=>{
              try
              {
                const {name} = req.body
                const language = await prisma.language.create({
                    data: {
                        name
                    }
                });
                return res.status(201).json({message: 'Language created', language})
                }
                catch(error){
                    console.log(error)
                    return res.status(400).json({error: 'Something went wrong'})
                }
            })
            
            app.get('/language', async (req, res)=>{
                try{
                    const languages = await prisma.language.findMany(
                        {
                            include: {
                                translations: true
                            }
                        }
                    )
                    res.status(200).json(languages)
                }catch(e){
                    console.log(e)
                    res.status(500).json({error: 'Something went wrong'})
                }
            }
            )

            app.get('/language/:id', async (req, res)=>{
                try{
                    const {id} = req.params
                    const language = await prisma.language.findUnique({
                        where: {
                            id: parseInt(id)
                        },
                        include: {
                            translations: true
                        }
                    })
            
                    if(!language){
                        return res.status(404).json({error: 'Language not found'})
                    }
            
                    res.status(200).json(language)
            
                }catch(e){
                    console.log(e)
                    res.status(500).json({error: 'Something went wrong'})
                }
            })

            app.put('/language/:id', async (req, res)=>{
                try{
                    const {id} = req.params
                    const {name} = req.body
                    const language = await prisma.language.findFirst({
                        where: {
                            id: parseInt(id)
                        }
                    })
                    if(!language){
                        return res.status(404).json({error: 'Language not found'})
                    }
            
                    await prisma.language.update({
                        where: {
                            id: parseInt(id)
                        },
                        data: {
                            name: name || language.name
                        }
                    })
            
                    res.status(200).json({message: 'Language updated'})
                }catch(e){
                    console.log(e)
                    res.status(500).json({error: 'Something went wrong'})
                }
            })

            app.patch('/language/:id', async (req, res)=>{
                try{
                    const {id} = req.params
                    const {status} = req.body
                    const language = await prisma.language.findFirst({
                        where: {
                            id: parseInt(id)
                        }
                    })
                    if(!language){
                        return res.status(404).json({error: 'Language not found'})
                    }
            
                    await prisma.language.update({
                        where: {
                            id: parseInt(id)
                        },
                        data: {
                            status: status || language.status
                        }
                    })
            
                    res.status(200).json({message: 'Language status updated', language})
                }catch(e){
                    console.log(e)
                    res.status(500).json({error: 'Something went wrong'})
                }
            })

///////////////////////////////////Translation/////////////////////////////////////


app.post('/translation', async (req, res)=>{
     
        try{

         const {languageId, translate} = req.body
         for (const [key, value] of Object.entries(translate[0])) {
            await prisma.translationTable.create({
              data: {
                languageId: languageId,
                key: key,
                value: value,
              },
            });
          }
         res.status(201).json({message: 'Translation created'})
        }catch(error){
            console.log(error)
             return res.status(400).json({error: 'Something went wrong'})
        }
     }
    )

    app.get('/translation', async (req, res)=>{
        try{
            const translations = await prisma.translationTable.findMany({
                include: {
                        language: true
                }
            })

            res.status(200).json(translations)
        }catch(e){
            console.log(e)
            res.status(500).json({error: 'Something went wrong'})
        }
    })
























const server = http.createServer(
    app
);
    
server.listen(port, hostname, () => {
        console.log(`Server running at http://${hostname}:${port}/`);
    });






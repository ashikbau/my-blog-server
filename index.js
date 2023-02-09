require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion,  ObjectId, ReadConcernLevel } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

const cors = require("cors");

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0avqkuj.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
  try {
    const db = client.db("myblog");
    const blogCollection = db.collection("blog");

    // app.get("/blogs", async (req, res) => {
    //   const cursor = blogCollection.find();
    //   const blog = await cursor.toArray();

    //   res.send(blog);
    // });

    app.post("/blogs", async (req, res) => {
      const blog = req.body;

      const result = await blogCollection.insertOne(blog);

      res.send(result);
    });

    app.get("/blogs/:id", async (req, res) => {
      const id = req.params.id;
      
      
      filter ={ _id: new ObjectId(id) }

      const result = await blogCollection.findOne(filter);
      res.send(result);
    });

   

    app.get('/blogs', async (req, res) => {
      console.log(req.query)
     
      if(req.query.category){
        
        const category = req.query.category;
      //  query = {};
      let query = {};
     
          query = {
              category: category
          }


     
      const cursor = blogCollection.find(query);
      const blogs = await cursor.toArray();
      
      res.send(blogs);
      } else if (req.query.text){
        const search = req.query.text;
            console.log('serachText',req.query);
            let query = { };
            if (search) {
                query = {
                    $text: {
                        $search: search
                    }
                }

            }

            console.log(query)
          
            const cursor = blogCollection.find(query);
            const blogs = await cursor.toArray();
            console.log(blogs)
            res.send(blogs);
            // res.send({msg:'hello from text'});

      } else{
        console.log('Hello from else')
        const cursor = blogCollection.find();
        const blog = await cursor.toArray();
  
        res.send(blog);
      }
      
  });

    
app.put('/blogs/:id',  async (req, res) => {
  
  const id = req.params.id;
  const formValue=req.body
  const filter = { _id: new ObjectId(id) }
  // console.log(product,filter)
  const options = { upsert: true };
  const updatedDoc = {
      $set: 
         {title:formValue.title,
          category:formValue.category,
          description:formValue.description,
          imageUrl:formValue.imageUrl,
          
        }
      
  }
  // const result = await blogCollection.deleteOne(filter);
  const finalresult= await blogCollection.updateOne(filter,updatedDoc,options)
  // console.log(result)
  res.send(finalresult);
});

    app.delete("/blogs/:id", async (req, res) => {
      const id = req.params.id;

      const result = await blogCollection.deleteOne({ _id: new ObjectId(id)});
      res.send(result);
    });
  } finally {
  }
};

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
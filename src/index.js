//For env File
require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { ObjectId, MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gaxw2ro.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const todosCollection = client.db("reduxTodoApp").collection("todos");

    // app.get("/todos", async (req: Request, res: Response) => {
    //   try {
    //     const result = await todosCollection.find().toArray();
    //     res.send(result);
    //   } catch (error) {
    //     res.status(500).send({ error: "Server Error." });
    //   }
    // });
    app.post("/todo", async (req, res) => {
      const todo = req.body;
      const result = await todosCollection.insertOne(todo);
      res.send(result);
    });
    app.get("/todos", async (req, res) => {
      let query = {};
      if (req.query.priority) {
        query.priority = req.query.priority;
      }
      const cursor = await todosCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.put("/todo/:id", async (req, res) => {
      const id = req.params.id;
      const todo = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          isCompleted: todo.isCompleted,
          title: todo.title,
          description: todo.description,
          priority: todo.priority,
        },
      };
      const options = { upsert: true };
      const result = await todosCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to redux Todo application Server");
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

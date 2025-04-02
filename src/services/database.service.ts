//External dependencies
import * as mongoDB from "mongodb";
import * as dotenv from "dotenv";


// global variables
export const collections: {users?: mongoDB.Collection } = {}


// initialize connection
export async function connectToDatabase () {
    dotenv.config();
 
    const client: mongoDB.MongoClient = new mongoDB.MongoClient(process.env.DB_CONN_STRING);
            
    await client.connect();
        
    const db: mongoDB.Db = client.db(process.env.DB_NAME);
   
    const usersCollection: mongoDB.Collection = db.collection(process.env.USERS_COLLECTION_NAME);
 
  collections.users = usersCollection;
       
         console.log(`Successfully connected to database: ${db.databaseName} and collection: ${usersCollection.collectionName}`);
 }
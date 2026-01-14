
import mongoose from "mongoose";

const mongoConnect = async () => {
  try {
    // const url="mongodb+srv://NeedCode:ujWLY3ePFKbfLEJY@cluster0.rndue1t.mongodb.net/NeedForCode";
    const url="mongodb+srv://clarkkent080205_db_user:KgeENoWUWlIRll08@lungi.y4xuwh2.mongodb.net/?appName=lungi";
    
    const conn = await mongoose.connect(url);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
  }
};

export default mongoConnect;
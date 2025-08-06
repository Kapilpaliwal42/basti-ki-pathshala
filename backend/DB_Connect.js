import mongoose from "mongoose";

const DBConnect = async ()=>{
    try {
        await mongoose.connect(process.env.DATABASE)
        console.log("Database Connected Successfully !")
    }
    catch(error){
        console.log("Database Connection Failed !" + error)
    
    }
} 
export default DBConnect;
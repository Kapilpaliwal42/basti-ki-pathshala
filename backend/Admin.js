import mongoose from "mongoose"; 

const AdminSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim: true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim: true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:['admin','superadmin','manager'],
        default:'admin'
    }
}, ); 
const Admin = mongoose.model('Admin', AdminSchema);
export default Admin;
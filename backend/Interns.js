import mongoose from "mongoose";

const InternsSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim: true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim: true,
        lowercase: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    college: {
        type: String,
        required: true,
        trim: true
    },
    course: {
        type: String,
        required: true,
        trim: true
    },
    yearOfStudy: {
        type: Number,
        required: true
    },
    skills: {
        type: [String], 
        default: []
    },
    resumeUrl: {
        type: String,
        required: true 
    },
    linkedInProfile: {
        type: String,
        default: ''
    },
    githubProfile: {
        type: String,
        default: ''
    }
}); 
const Intern = mongoose.model('Intern', InternsSchema);
export default Intern;
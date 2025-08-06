import jwt from "jsonwebtoken";
import Admin from "./Admin.js";
import Intern from "./Interns.js";
import bcrypt from "bcrypt";
const GenerateToken = (user)=>{
    return jwt.sign(
        {
            id: user._id,
            role: user.role
        }, process.env.KEY, { expiresIn: "1h" })

}

export const signup = async (req, res) => {
    const { name, email, password, role } = req.body;
    if(!name || !email || !password || !role){
        return res.status(400).send({message:"bad request : missing fields!"})
    }
    try{
        const existingUser = await Admin.findOne({ email });
        if (existingUser) {
            return res.status(400).send({ message: 'User already exists' });
        
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        let newAdmin =  Admin.create({ name: name, email: email, password: hashedPassword, role: role });
        delete newAdmin.password;
      return  res.status(201).json({ 
            message: 'User created successfully!',
            token: GenerateToken(newAdmin),
            user: (await newAdmin).toObject()
        });
    }
    catch(error){
        console.log(error);
     return   res.status(500).json({ message: 'Internal server error' });
    }
 
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    if(!email||!password){
        return res.status(400).json({message:"bad request : missing fields!"})

    }
    try {
        const user = await Admin.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password or user does not exist!' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if(!passwordMatch){
            return res.status(401).json({ message: 'Invalid password!' });
        
        }
        res.status(200).json({
            token: GenerateToken(user),
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                name: user.name
            }
        });
    } catch (error) {
        console.log(error);
      return  res.status(500).json({ message: 'Internal server error' });
    }
}

export const getIntern = async (req, res) => {
    const {name,email,phoneNumber,college,course,yearOfStudy,skills,resumeUrl,linkedInProfile,githubProfile} = req.body;
    if(!name || !email || !phoneNumber || !college || !course || !yearOfStudy || !skills || !resumeUrl){
      return  res.status(400).send({message:"bad request : missing fields!"})
    }

    try {
        const interns = await Intern.findOne({ email });
        if (interns) {
            return res.status(400).json({ message: 'Intern response already exists' });
        }
        const newIntern =  Intern.create({
            name: name,
            email: email,
            phoneNumber: phoneNumber,
            college: college,
            course: course,
            yearOfStudy: yearOfStudy,
            skills: skills,
            resumeUrl: resumeUrl,
            linkedInProfile: linkedInProfile,
            githubProfile: githubProfile
        });

       return res.status(201).json({message:"Intern response submitted successfully!",intern:(await newIntern).toObject()});
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
        
    }
        
    export const getInterns = async (req, res) => {
        try {
            const interns = await Intern.find().select();
           return res.status(200).json(interns);
        } catch (error) {
          return  res.status(500).json({ message: 'Internal server error' });
        }
    }





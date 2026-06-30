const mongoose=require('mongoose');
const bcrypt=require('bcryptjs')

const userSchema=new mongoose.Schema({
    email:{
        type:String,
        required:[true,"Email is required for creating an account"],
        trim:true,
        lowercase:true,
        unique:[true,"Email already exist"]
    },
    name:{
        type:String,
        required:[true,"Name is required for creating an account"]
    },
    password:{
        type:String,
        required:[true,"Password is required for creating an account"],
        minlength:[6,"Password should contain more than six characters"],
        select:false
    },
    systemUser:{
        type:Boolean,
        default:false,
        immutable:true,
        select:false
    }
},{
    timestamps:true
})


userSchema.pre("save", async function(){
    if(!this.isModified("password")){
        return
    }

    const hash=await bcrypt.hash(this.password,10);
    this.password=hash;
    
})

userSchema.methods.comparePassword= async function(password){
    return await bcrypt.compare(password,this.password)
}


const userModel=mongoose.model("User",userSchema);

module.exports=userModel
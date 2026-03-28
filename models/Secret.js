const mongoose=require('mongoose');
const SecretSchema=new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String, 
        required: true,
        trim: true
    },
    category: { 
        type: String, 
        enum: ['Login', 'API Key', 'Note'], 
        required: true 
    },
    identifier: {type: String, trim:true},
    url: {type: String, trim: true},
    encryptedValue: {type: String, required: true},
    iv: { type: String, required: true}
}, {timestamps: true});
module.exports=mongoose.model('Secret',SecretSchema)
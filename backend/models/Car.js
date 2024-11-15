import mongoose from 'mongoose'

const carSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  tags: [{
    type: String
  }],
  images: [{
    url: String,
    public_id: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.model('Car', carSchema)
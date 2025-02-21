import mongoose from 'mongoose';

const ClassroomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a classroom name'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  createdBy: {
    type: String,
    required: [true, 'Teacher ID is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Classroom || mongoose.model('Classroom', ClassroomSchema);

import mongoose from 'mongoose';

const permissionSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    }
  }
);

const Permission = mongoose.model('Permission', permissionSchema);

export default Permission;

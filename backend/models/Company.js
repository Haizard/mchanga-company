import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
    },
    totalVehicles: {
      type: Number,
      default: 0,
    },
    totalCustomers: {
      type: Number,
      default: 0,
    },
    services: [
      {
        name: String,
        description: String,
        price: Number,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Company', companySchema);


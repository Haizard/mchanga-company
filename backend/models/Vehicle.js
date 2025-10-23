import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
    },
    make: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    color: String,
    licensePlate: {
      type: String,
      required: true,
      unique: true,
    },
    vin: {
      type: String,
      unique: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance', 'retired'],
      default: 'active',
    },
    currentLocation: {
      latitude: Number,
      longitude: Number,
      lastUpdated: Date,
    },
    fuelCapacity: Number,
    currentFuel: Number,
    totalTrips: {
      type: Number,
      default: 0,
    },
    totalDistance: {
      type: Number,
      default: 0,
    },
    lastServiceDate: Date,
    nextServiceDate: Date,
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Vehicle', vehicleSchema);


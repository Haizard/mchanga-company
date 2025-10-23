// Validation middleware
export const validateCompany = (req, res, next) => {
  const { name, registrationNumber, email, phone } = req.body;
  
  if (!name || !registrationNumber || !email || !phone) {
    return res.status(400).json({ error: 'Missing required fields: name, registrationNumber, email, phone' });
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  next();
};

export const validateVehicle = (req, res, next) => {
  const { registrationNumber, make, model, year, licensePlate } = req.body;
  
  if (!registrationNumber || !make || !model || !year || !licensePlate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  if (year < 1900 || year > new Date().getFullYear() + 1) {
    return res.status(400).json({ error: 'Invalid year' });
  }
  
  next();
};

export const validateCustomer = (req, res, next) => {
  const { firstName, lastName, email, phone } = req.body;
  
  if (!firstName || !lastName || !email || !phone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  next();
};

export const validateTrip = (req, res, next) => {
  const { tripNumber, vehicle, customer, startTime, fare } = req.body;
  
  if (!tripNumber || !vehicle || !customer || !startTime || !fare) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  if (fare < 0) {
    return res.status(400).json({ error: 'Fare cannot be negative' });
  }
  
  next();
};

export const validatePayment = (req, res, next) => {
  const { paymentNumber, customer, amount, paymentMethod } = req.body;
  
  if (!paymentNumber || !customer || !amount || !paymentMethod) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  if (amount <= 0) {
    return res.status(400).json({ error: 'Amount must be greater than 0' });
  }
  
  const validMethods = ['cash', 'card', 'mobile_money', 'bank_transfer'];
  if (!validMethods.includes(paymentMethod)) {
    return res.status(400).json({ error: 'Invalid payment method' });
  }
  
  next();
};

export const validateService = (req, res, next) => {
  const { vehicle, serviceType, cost, serviceDate } = req.body;
  
  if (!vehicle || !serviceType || !cost || !serviceDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  if (cost < 0) {
    return res.status(400).json({ error: 'Cost cannot be negative' });
  }
  
  next();
};

export const validateFuel = (req, res, next) => {
  const { vehicle, fuelType, quantityAdded, cost } = req.body;
  
  if (!vehicle || !fuelType || !quantityAdded || !cost) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  if (quantityAdded <= 0 || cost < 0) {
    return res.status(400).json({ error: 'Invalid quantity or cost' });
  }
  
  next();
};

export const validateEmergency = (req, res, next) => {
  const { vehicle, emergencyType, description } = req.body;
  
  if (!vehicle || !emergencyType || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  next();
};


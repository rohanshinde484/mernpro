
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();
const port = process.env.PORT   
 || 4000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/', {
  
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error
    ('MongoDB  connection error:', err));

// Define the  ransaction schema
const transactionSchema = new mongoose.Schema({
id: {type: Number, required: true, unique: true},
title: {type: String, required: true},
price: {type: Number, required: true},
description: {type: String, required: true},
category: {type: String, required: true},
image: {type: String, required: true},
sold: {type: Boolean, required: true},
dateOfSale: {type: Date, required: true}

});

const Transaction = mongoose.model('Transaction', transactionSchema);

// Initialize database with data from third-party API
async function initializeDatabase() {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const   
 data = response.data;   


    const transactions = data.map(transaction => new Transaction(transaction));
    await Transaction.insertMany(transactions);
    console.log('Database initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// API endpoints
app.get('/transactions', async (req, res) => {
  const { month, search, page = 1, perPage = 10 } = req.query;

  const query = {};
  if (month) {
    const startDate = new Date(new Date().getFullYear(), month - 1, 1);
    const endDate = new Date(new Date().getFullYear(), month, 0);
    query.dateOfSale = { $gte: startDate, $lt: endDate };
  }

  if (search) {
    const searchRegex = new RegExp(search, 'i');
    query.$or = [
      { productTitle: searchRegex },
      { description: searchRegex },
      { price: { $regex: searchRegex } }
    ];
  }

  try {
    const transactions = await Transaction.find(query)
      .skip((page - 1) * perPage)
      .limit(perPage);

    res.json(transactions);
  } catch (error) {
    console.error('Error  fetching transactions:', error);
    res.status(500).json({ error: 'Internal Server Error'   
 });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  initializeDatabase();   

});
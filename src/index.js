const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const scrapeTrends = require('./scrapeTrends');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Configuration
const corsOptions = {
  origin: ['https://stir-ykbo.vercel.app', 'http://localhost:3000'], // Allow multiple origins
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// MongoDB connection
const mongodbUrl = process.env.DB_URL;
mongoose
  .connect(mongodbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Connection error:', err));

// Schema and Model for trends
const trendSchema = new mongoose.Schema({
  trend: String,
  posts: String,
  timestamp: { type: Date, default: Date.now }
});
const Trend = mongoose.model('Trend', trendSchema);

// Middleware
app.use(express.json());

app.get('/',(req,res)=>{
  res.send("Web Scraper Working Successfully!")
})

// Scrape trends and save them to MongoDB
app.get('/scrape', async (req, res) => {
  try {
    const trends = await scrapeTrends();
    await Trend.deleteMany({});
    const trendDocuments = trends.map(trend => ({
      trend: trend.trend,
      posts: trend.posts
    }));
    await Trend.insertMany(trendDocuments);
    res.json({ success: true, message: 'Trends scraped and saved successfully.', trends });
  } catch (error) {
    console.error('Error scraping trends:', error);
    res.status(500).json({ success: false, message: 'Failed to scrape trends', error: error.message });
  }
});

// Fetch trends from MongoDB
app.get('/trends', async (req, res) => {
  try {
    const trends = await Trend.find().sort({ timestamp: -1 });
    res.json({ success: true, message: 'Trends fetched successfully.', trends });
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch trends', error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

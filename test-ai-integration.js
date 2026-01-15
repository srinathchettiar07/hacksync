// Test AI Integration
// Run: node test-ai-integration.js

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testAI(imagePath) {
  console.log('\n🧪 Testing AI Classification Service...\n');
  console.log(`📸 Image: ${imagePath}\n`);

  if (!fs.existsSync(imagePath)) {
    console.error(`❌ Image not found: ${imagePath}`);
    return;
  }

  const formData = new FormData();
  formData.append('file', fs.createReadStream(imagePath));

  try {
    console.log('📤 Sending request to http://127.0.0.1:8000/classify...\n');
    
    const response = await axios.post(
      'http://127.0.0.1:8000/classify',
      formData,
      { 
        headers: formData.getHeaders(),
        timeout: 30000 // 30 seconds timeout
      }
    );

    console.log('✅ AI Response Received!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Predicted Category: ${response.data.predicted_category}`);
    console.log(`🎯 Confidence: ${(response.data.confidence * 100).toFixed(2)}%`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Category mapping (same as server)
    const categoryMap = {
      pothole: "Pothole",
      streetlight: "Streetlight",
      garbage: "Garbage",
      waterlogging: "Water",
      other: "Other"
    };

    const mappedCategory = categoryMap[response.data.predicted_category.toLowerCase()] || "Other";
    console.log(`🗂️  Mapped Category (for database): ${mappedCategory}\n`);

  } catch (error) {
    console.error('❌ Error testing AI service:\n');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('   → FastAPI service is not running!');
      console.error('   → Start it with: cd civic-ai && uvicorn ai_service:app --reload --port 8000\n');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('   → Request timed out. Service may be slow or not responding.\n');
    } else if (error.response) {
      console.error(`   → Server error: ${error.response.status}`);
      console.error(`   → Message: ${error.response.data}\n`);
    } else {
      console.error(`   → ${error.message}\n`);
    }
  }
}

// Get image path from command line or use default
const imagePath = process.argv[2] || path.join(__dirname, 'civic-ai', 'images', 'ph4.jpg');

testAI(imagePath);


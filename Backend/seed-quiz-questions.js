const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./Config/db');
const Game = require('./Models/Game');

const defaultQuestions = [
  {
    question: "Which product is best for dry skin?",
    options: ["Oil Control Face Wash", "Hydrating Moisturizer", "Brightening Serum", "Acne Pimple Gel"],
    correctIdx: 1
  },
  {
    question: "What should you apply before stepping out in the sun?",
    options: ["Body Lotion", "SPF 50 Sunscreen", "Night Cream", "Face Scrub"],
    correctIdx: 1
  },
  {
    question: "Which ingredient is known for anti-aging benefits?",
    options: ["Salicylic Acid", "Vitamin C", "Retinol", "Aloe Vera"],
    correctIdx: 2
  },
  {
    question: "What is the best fabric for summer clothing?",
    options: ["Polyester", "Wool", "Linen", "Velvet"],
    correctIdx: 2
  },
  {
    question: "Which gadget helps track your daily steps & heart rate?",
    options: ["Smartwatch", "Bluetooth Speaker", "Wireless Earbuds", "Power Bank"],
    correctIdx: 0
  },
  {
    question: "Which vitamin is famous for skin brightening and reducing dark spots?",
    options: ["Vitamin A", "Vitamin C", "Vitamin D", "Vitamin E"],
    correctIdx: 1
  },
  {
    question: "How often should you ideally exfoliate your face?",
    options: ["Every day", "1-2 times a week", "Once a month", "Never"],
    correctIdx: 1
  },
  {
    question: "What is the primary benefit of Hyaluronic Acid for skin?",
    options: ["Exfoliation", "Intense Hydration", "Sun Protection", "Acne Clearance"],
    correctIdx: 1
  },
  {
    question: "Which hair care product is used to lock in moisture after washing?",
    options: ["Shampoo", "Hair Conditioner", "Hair Wax", "Dry Shampoo"],
    correctIdx: 1
  },
  {
    question: "What is the main benefit of using a silk pillowcase for hair and skin?",
    options: ["Reduces friction & retains moisture", "Promotes faster hair growth", "Prevents dandruff", "Cooling effect only"],
    correctIdx: 0
  }
];

const seedQuestions = async () => {
  try {
    await connectDB();
    console.log('Connected to database.');
    
    const quizGame = await Game.findOne({ key: 'quiz' });
    if (!quizGame) {
      console.log('Quiz game key "quiz" not found in DB!');
      process.exit(1);
    }
    
    quizGame.questions = defaultQuestions;
    await quizGame.save();
    
    console.log('Successfully seeded 10 dynamic quiz questions in DB!');
    mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Error seeding questions:', err);
    process.exit(1);
  }
};

seedQuestions();

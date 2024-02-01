// Import the necessary modules
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const connectDB = require("../src/database"); // Import your connectDB function

const User = require("../src/models/UserModel");

// Create a new MongoDB in-memory server
let mongod;

// Connect to the in-memory database
beforeAll(async () => {
  // Create new mongo memory server
  mongod = await MongoMemoryServer.create({
    instance: { dbName: "jest" },
  });

  // Connect to server
  const uri = mongod.getUri();
  await connectDB(uri);
});

// Test that we are connected to the in-memory database
test("Connect to MongoDB", async () => {
  for (let x = 0; x < mongoose.connections.length; x++) {
    console.info(mongoose.connections[x].name);
  }

  expect(mongoose.connections[0].name).toBe("test");
});

test("Create User entry", async () => {
  const TEST_EMAIL = "test@gmail.com";

  const newUser = new User({
    email: TEST_EMAIL,
    sessionToken: "123456789",
    lastLogin: Date.now(),
    subscriptionTier: 0,
  });

  await newUser.save();

  const userDoc = await User.findOne({
    email: TEST_EMAIL,
  });

  expect(userDoc.email).toBe(TEST_EMAIL);
});

// Disconnect from the in-memory database
afterAll(async () => {
  await mongoose.connection.close();
  await mongod.stop();
});

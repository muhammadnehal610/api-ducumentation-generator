const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Controller = require('./models/controller.model');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI);

const initialId1 = new mongoose.Types.ObjectId();
const initialId2 = new mongoose.Types.ObjectId();

const initialControllers = [
  {
    _id: initialId1,
    name: "User Management",
    description: "APIs for managing user accounts and profiles.",
    globalHeaders: [
      { key: 'Authorization', value: 'Bearer {JWT_TOKEN}', description: 'Authentication token is required for all endpoints in this group.' },
      { key: 'Content-Type', value: 'application/json', description: 'All requests should use JSON.' },
    ],
    routes: [
      {
        _id: initialId2,
        endpoint: '/users/{userId}',
        method: 'GET',
        description: 'Retrieves the details of a specific user by their unique ID.',
        tags: ['Users', 'Profiles'],
        headers: [],
        queryParams: [
          { key: 'include_details', value: 'true', description: 'Include extended user details.' }
        ],
        requestBodyExample: '',
        requestBodySchema: [],
        responses: [
          {
            statusCode: '200 OK',
            description: 'User details retrieved successfully.',
            bodyExample: '{\n  "id": "12345",\n  "name": "John Doe",\n  "email": "john.doe@example.com"\n}',
            schema: [
              { key: 'id', type: 'string', description: 'Unique identifier for the user.', required: true },
              { key: 'name', type: 'string', description: 'Full name of the user.', required: true },
              { key: 'email', type: 'string', description: 'Email address of the user.', required: true },
            ]
          },
          {
            statusCode: '404 Not Found',
            description: 'The requested user could not be found.',
            bodyExample: '{\n  "error": "User not found"\n}',
            schema: [
              { key: 'error', type: 'string', description: 'Description of the error.', required: true }
            ]
          }
        ]
      }
    ]
  }
];

const importData = async () => {
    try {
        await Controller.deleteMany();
        await Controller.insertMany(initialControllers);
        console.log('Data Imported!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

const deleteData = async () => {
    try {
        await Controller.deleteMany();
        console.log('Data Destroyed!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    deleteData();
} else {
    importData();
}

const mongoose = require('mongoose');
const { Schema } = mongoose;

// Utility function to set up the toJSON transform
const setupToJsonTransform = (schema) => {
    schema.virtual('id').get(function() {
        return this._id.toHexString();
    });

    schema.set('toJSON', {
        virtuals: true,
        versionKey: false,
        transform: function (doc, ret) {
            delete ret._id;
        }
    });
};


const HeaderSchema = new Schema({
    key: { type: String, required: true },
    value: { type: String, default: '' },
    description: { type: String, default: '' }
});

const ParameterSchema = new Schema({
    key: { type: String, required: true },
    value: { type: String, default: '' },
    description: { type: String, default: '' }
});

const SchemaFieldSchema = new Schema({
    key: { type: String, required: true },
    type: { type: String, required: true, default: 'string' },
    description: { type: String, default: '' },
    required: { type: Boolean, default: false }
});

const ApiResponseSchema = new Schema({
    statusCode: { type: String, required: true },
    description: { type: String, default: '' },
    bodyExample: { type: String, default: '' },
    schema: [SchemaFieldSchema]
});

const ApiDocSchema = new Schema({
    endpoint: { type: String, required: true },
    method: { 
        type: String, 
        required: true, 
        enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'] 
    },
    description: { type: String, default: '' },
    tags: [String],
    headers: [HeaderSchema],
    queryParams: [ParameterSchema],
    requestBodyExample: { type: String, default: '' },
    requestBodySchema: [SchemaFieldSchema],
    responses: [ApiResponseSchema]
});

// Apply transforms to all sub-schemas to ensure 'id' field is present
setupToJsonTransform(HeaderSchema);
setupToJsonTransform(ParameterSchema);
setupToJsonTransform(SchemaFieldSchema);
setupToJsonTransform(ApiResponseSchema);
setupToJsonTransform(ApiDocSchema);

const ControllerSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Please add a controller name'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    globalHeaders: [HeaderSchema],
    routes: [ApiDocSchema]
}, {
    timestamps: true
});

setupToJsonTransform(ControllerSchema);

module.exports = mongoose.model('Controller', ControllerSchema);


const Controller = require('../models/controller.model');

// @desc    Get all controllers
// @route   GET /api/controllers
// @access  Public
exports.getControllers = async (req, res) => {
    try {
        const controllers = await Controller.find();
        res.status(200).json(controllers);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Create a new controller
// @route   POST /api/controllers
// @access  Public
exports.createController = async (req, res) => {
    try {
        const controller = await Controller.create(req.body);
        res.status(201).json(controller);
    } catch (error) {
        res.status(400).json({ message: 'Error creating controller', error: error.message });
    }
};

// @desc    Update a controller
// @route   PUT /api/controllers/:id
// @access  Public
exports.updateController = async (req, res) => {
    try {
        const controller = await Controller.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!controller) {
            return res.status(404).json({ message: 'Controller not found' });
        }
        res.status(200).json(controller);
    } catch (error) {
        res.status(400).json({ message: 'Error updating controller', error: error.message });
    }
};

// @desc    Delete a controller
// @route   DELETE /api/controllers/:id
// @access  Public
exports.deleteController = async (req, res) => {
    try {
        const controller = await Controller.findByIdAndDelete(req.params.id);
        if (!controller) {
            return res.status(404).json({ message: 'Controller not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Add a route to a controller
// @route   POST /api/controllers/:id/routes
// @access  Public
exports.addRoute = async (req, res) => {
    try {
        const controller = await Controller.findById(req.params.id);
        if (!controller) {
            return res.status(44).json({ message: 'Controller not found' });
        }
        controller.routes.push(req.body);
        await controller.save();
        res.status(201).json(controller);
    } catch (error) {
        res.status(400).json({ message: 'Error adding route', error: error.message });
    }
};

// @desc    Update a specific route in a controller
// @route   PUT /api/controllers/:controllerId/routes/:routeId
// @access  Public
exports.updateRoute = async (req, res) => {
    try {
        const { controllerId, routeId } = req.params;
        const controller = await Controller.findById(controllerId);

        if (!controller) {
            return res.status(404).json({ message: 'Controller not found' });
        }

        const route = controller.routes.id(routeId);
        if (!route) {
            return res.status(404).json({ message: 'Route not found' });
        }

        // Update route properties
        Object.assign(route, req.body);
        
        await controller.save();
        res.status(200).json(controller);
    } catch (error) {
        res.status(400).json({ message: 'Error updating route', error: error.message });
    }
};

// @desc    Delete a route from a controller
// @route   DELETE /api/controllers/:controllerId/routes/:routeId
// @access  Public
exports.deleteRoute = async (req, res) => {
    try {
        const { controllerId, routeId } = req.params;
        const controller = await Controller.findById(controllerId);

        if (!controller) {
            return res.status(404).json({ message: 'Controller not found' });
        }
        
        const route = controller.routes.id(routeId);
        if (!route) {
            return res.status(404).json({ message: 'Route not found' });
        }

        route.deleteOne();

        await controller.save();
        res.status(200).json(controller);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
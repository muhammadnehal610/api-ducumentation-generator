const express = require('express');
const router = express.Router();
const {
    getControllers,
    createController,
    updateController,
    deleteController,
    addRoute,
    updateRoute,
    deleteRoute
} = require('../controllers/controller.controller');

// Routes for controllers
router.route('/')
    .get(getControllers)
    .post(createController);

router.route('/:id')
    .put(updateController)
    .delete(deleteController);

// Routes for nested routes within a controller
router.route('/:id/routes')
    .post(addRoute);

router.route('/:controllerId/routes/:routeId')
    .put(updateRoute)
    .delete(deleteRoute);

module.exports = router;

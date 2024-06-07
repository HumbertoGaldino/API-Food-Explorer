const { Router } = require("express");

const OrdersController = require("../controllers/OrdersController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");
const verifyAdminPrivileges = require("../middlewares/verifyAdminPrivileges");

const ordersRoutes = Router();

const ordersController = new OrdersController();

ordersRoutes.use(ensureAuthenticated);

ordersRoutes.get("/", ordersController.index);
ordersRoutes.post("/", ordersController.create);
ordersRoutes.get("/:id", ordersController.show);
ordersRoutes.delete("/:id", verifyAdminPrivileges, ordersController.delete);
ordersRoutes.patch("/:id", verifyAdminPrivileges, ordersController.update);

module.exports = ordersRoutes;

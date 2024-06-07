const { Router } = require("express");

const CartsController = require("../controllers/CartsController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");

const cartsRoutes = Router();

const cartsController = new CartsController();

cartsRoutes.use(ensureAuthenticated);

cartsRoutes.get("/", cartsController.index);
cartsRoutes.post("/", cartsController.create);
cartsRoutes.get("/:id", cartsController.show);
cartsRoutes.delete("/:id", cartsController.delete);
cartsRoutes.delete("/:id/item/:dish_id", cartsController.deleteItem);
cartsRoutes.patch("/:id", cartsController.update);

module.exports = cartsRoutes;

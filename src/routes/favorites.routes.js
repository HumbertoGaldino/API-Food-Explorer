const { Router } = require("express");

const FavoritesController = require("../controllers/FavoritesController");
const authMiddleware = require("../middlewares/ensureAuthenticated");

const favoritesRouter = Router();

const favoritesController = new FavoritesController();

favoritesRouter.use(authMiddleware);

favoritesRouter.get("/", favoritesController.index);
favoritesRouter.post("/:dish_id", favoritesController.create);
favoritesRouter.delete("/:dish_id", favoritesController.delete);

module.exports = favoritesRouter;

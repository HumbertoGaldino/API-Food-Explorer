const { Router } = require("express");
const multer = require("multer");
const uploadConfig = require("../configs/upload");

const DishesController = require("../controllers/DishesController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");
const verifyAdminPrivileges = require("../middlewares/verifyAdminPrivileges");

const dishesRoutes = Router();
const upload = multer(uploadConfig.MULTER);

const dishesController = new DishesController();

dishesRoutes.use(ensureAuthenticated);

dishesRoutes.get("/:id", dishesController.show);

dishesRoutes.post(
  "/",
  verifyAdminPrivileges,
  upload.single("image"),
  dishesController.create
);

dishesRoutes.get("/", dishesController.index);

dishesRoutes.delete("/:id", verifyAdminPrivileges, dishesController.delete);

dishesRoutes.patch(
  "/:id",
  verifyAdminPrivileges,
  upload.single("image"),
  dishesController.update
);

module.exports = dishesRoutes;

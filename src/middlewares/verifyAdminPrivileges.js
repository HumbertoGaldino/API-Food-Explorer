const knex = require("../database/knex");
const AppError = require("../utils/AppError");

async function verifyAdminPrivileges(req, res, next) {
  const userId = req.user.id;

  try {
    // SEARCH USER BY ID
    const user = await knex("users").where({ id: userId }).first();

    // VERIFY ADMIN PERMISSION
    if (!user || !user.is_admin) {
      throw new AppError(
        "Somente administradores podem realizar esta ação.",
        403
      );
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = verifyAdminPrivileges;

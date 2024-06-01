const knex = require("../database/knex");

class FavoritesController {
  async create(request, response) {
    const { dish_id } = request.params;
    const user_id = request.user.id;

    console.log(dish_id);
    console.log(user_id);

    try {
      const favorite = await knex("favorites").insert({
        user_id,
        dish_id,
      });

      return response.json("Favorito adicionado com sucesso!");
    } catch (error) {
      return response
        .status(500)
        .json({ error: "Falha ao adicionar favorito!" });
    }
  }

  async index(request, response) {
    const user_id = request.user.id;

    try {
      const favorites = await knex("favorites")
        .select("dishes.*", "favorites.dish_id")
        .innerJoin("dishes", "dishes.id", "favorites.dish_id")
        .where({ user_id });

      return response.json(favorites);
    } catch (error) {
      return response
        .status(500)
        .json({ error: "Falha ao coletar os favoritos" });
    }
  }

  async delete(request, response) {
    const { dish_id } = request.params;
    const user_id = request.user.id;

    try {
      await knex("favorites").where({ user_id, dish_id }).delete();

      return response.json({ message: "Favorito removido com sucesso!" });
    } catch (error) {
      return response
        .status(500)
        .json({ error: "Falha ao remover o favorito." });
    }
  }
}

module.exports = FavoritesController;

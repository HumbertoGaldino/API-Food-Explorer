const knex = require("../database/knex");
const CustomError = require("../utils/AppError");

class CartsController {
  async create(request, response) {
    const { cart_items } = request.body;
    const user_id = request.user.id;

    const [cart_id] = await knex("carts").insert({
      user_id: user_id,
    });

    const itemsToInsert = cart_items.map((item) => ({
      cart_id: cart_id,
      dish_id: item.dish_id,
      dish_name: item.name,
      quantity: item.quantity,
    }));

    await knex("cart_items").insert(itemsToInsert);

    return response.json({ id: cart_id });
  }

  async show(request, response) {
    const { id } = request.params;

    const cart = await knex("carts").where({ id }).first();
    const cartItems = await knex("cart_items").where({
      cart_id: id,
    });

    return response.json({
      ...cart,
      items: cartItems,
    });
  }

  async update(request, response) {
    const { id } = request.params;
    const { cart_items } = request.body;

    const cart = await knex("carts").where({ id }).first();

    if (!cart) {
      throw new CustomError("Carrinho não encontrado.", 404);
    }

    const updateData = {
      updated_at: knex.fn.now(),
    };

    const existingItems = await knex("cart_items")
      .where({ cart_id: id })
      .select("dish_id");

    const itemsToUpdate = cart_items.map((item) => {
      if (existingItems.some((existing) => existing.dish_id === item.dish_id)) {
        return knex("cart_items")
          .where({ cart_id: id, dish_id: item.dish_id })
          .update({ quantity: item.quantity });
      } else {
        return knex("cart_items").insert({
          cart_id: id,
          dish_id: item.dish_id,
          dish_name: item.name,
          quantity: item.quantity,
        });
      }
    });

    await Promise.all(itemsToUpdate);
    await knex("carts").where({ id }).update(updateData);

    return response.json();
  }

  async index(request, response) {
    const user_id = request.user.id;

    const carts = await knex("carts")
      .select("id", "user_id")
      .where({ user_id: user_id })
      .orderBy("created_at", "desc");

    return response.json(carts);
  }

  async delete(request, response) {
    const { id } = request.params;

    await knex("cart_items").where({ cart_id: id }).delete();
    await knex("carts").where({ id }).delete();

    return response.json();
  }

  async deleteItem(request, response) {
    const { id, dish_id } = request.params;

    await knex("cart_items").where({ cart_id: id, dish_id: dish_id }).delete();

    return response.json();
  }
}

module.exports = CartsController;

const knex = require("../database/knex");

class OrdersController {
  async create(request, response) {
    const { status, price, payment_method, order_items } = request.body;
    const user_id = request.user.id;

    const [order_id] = await knex("orders").insert({
      status,
      price,
      payment_method,
      created_by: user_id,
    });

    const items = await Promise.all(
      order_items.map(async (item) => {
        const dish = await knex("dishes")
          .select("name")
          .where({ id: item.dish_id })
          .first();
        return {
          order_id: order_id,
          dish_id: item.dish_id,
          name: dish.name,
          quantity: item.quantity,
        };
      })
    );

    await knex("order_items").insert(items);

    return response.json({ order_id });
  }

  async show(request, response) {
    const { id } = request.params;

    const order = await knex("orders").where({ id }).first();
    const orderItems = await knex("order_items")
      .where({ order_id: id })
      .orderBy("name");

    return response.json({
      ...order,
      order_items: orderItems,
    });
  }

  async update(request, response) {
    const { id } = request.params;
    const { status, price, payment_method } = request.body;

    const order = await knex("orders").where({ id }).first();

    const updatedOrder = {
      status: status !== undefined ? status : order.status,
      price: price !== undefined ? price : order.price,
      payment_method:
        payment_method !== undefined ? payment_method : order.payment_method,
    };

    await knex("orders").where({ id }).update(updatedOrder);

    return response.json("Pedido atualizado com sucesso!");
  }

  async delete(request, response) {
    const { id } = request.params;

    await knex("orders").where({ id }).delete();

    return response.json("Pedido deletado com sucesso!");
  }

  async index(request, response) {
    const user_id = request.user.id;

    const user = await knex("users").where({ id: user_id }).first();

    const ordersQuery = knex("orders")
      .select([
        "orders.id",
        "orders.status",
        "orders.price",
        "orders.payment_method",
        "orders.created_at",
      ])
      .orderBy("orders.created_at", "desc");

    if (user.is_admin) {
      ordersQuery
        .select("users.name as created_by")
        .innerJoin("users", "users.id", "orders.created_by");
    } else {
      ordersQuery.where({ created_by: user_id });
    }

    const orders = await ordersQuery;

    const orderItems = await knex("order_items");

    const ordersWithItems = orders.map((order) => {
      const items = orderItems.filter((item) => item.order_id === order.id);
      const formattedItems = user.is_admin
        ? items
        : items.map(({ name, quantity }) => ({ name, quantity }));

      return {
        ...order,
        dishes: formattedItems,
      };
    });

    return response.json(ordersWithItems);
  }
}

module.exports = OrdersController;

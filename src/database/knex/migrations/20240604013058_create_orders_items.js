exports.up = (knex) =>
  knex.schema.createTable("order_items", (table) => {
    table.increments("id").primary();

    table
      .integer("order_id")
      .unsigned()
      .references("id")
      .inTable("orders")
      .onDelete("CASCADE");
    table
      .integer("dish_id")
      .unsigned()
      .references("id")
      .inTable("dishes")
      .onDelete("SET NULL");

    table.string("name").notNullable();
    table.integer("quantity").notNullable();
  });

exports.down = function (knex) {
  return knex.schema.dropTable("order_items");
};

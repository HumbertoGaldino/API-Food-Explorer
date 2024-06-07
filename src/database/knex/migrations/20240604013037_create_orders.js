exports.up = (knex) =>
  knex.schema.createTable("orders", (table) => {
    table.increments("id").primary();

    table.string("status").notNullable();
    table.decimal("price", 10, 2).notNullable();
    table.string("payment_method").notNullable();

    table
      .integer("created_by")
      .unsigned()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });

exports.down = function (knex) {
  return knex.schema.dropTable("orders");
};

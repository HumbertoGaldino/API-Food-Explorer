exports.up = function (knex) {
  return knex.schema.createTable("ingredients", function (table) {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.integer("dish_id").unsigned().notNullable();
    table.integer("created_by").unsigned().notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());

    table
      .foreign("dish_id")
      .references("id")
      .inTable("dishes")
      .onDelete("CASCADE");
    table
      .foreign("created_by")
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("ingredients");
};

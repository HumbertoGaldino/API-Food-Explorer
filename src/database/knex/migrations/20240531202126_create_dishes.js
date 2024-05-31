exports.up = function (knex) {
  return knex.schema.createTable("dishes", (table) => {
    table.increments("id").primary();
    table.string("name", 255).notNullable();
    table.string("description", 1000).notNullable();
    table.string("category", 255).notNullable();
    table.decimal("price", 10, 2).notNullable();
    table.string("image").default(null);

    table
      .integer("created_by")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table
      .integer("updated_by")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("dishes");
};

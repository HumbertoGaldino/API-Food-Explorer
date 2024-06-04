exports.up = function(knex) {
    return knex.schema.createTable("cart_items", function(table) {
      table.increments("id");
  
      table.integer("cart_id").unsigned().references("id").inTable("carts").onDelete("CASCADE");
      table.integer("dish_id").unsigned().references("id").inTable("dishes");
  
      table.string("dish_name").notNullable();
      table.integer("quantity").notNullable();
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable("cart_items");
  };
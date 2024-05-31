const knex = require("../database/knex");
const DiskStorage = require("../providers/DiskStorage");
const AppError = require("../utils/AppError");

class DishesController {
  // METHOD TO CREATE A NEW DISH
  async create(request, response) {
    const { name, description, category, price, ingredients } = request.body;
    const imageFile = request.file.filename;
    const userId = request.user.id;

    const diskStorage = new DiskStorage();
    const savedFilename = await diskStorage.saveFile(imageFile);

    const ingredientList = JSON.parse(ingredients || "[]");

    const [newDishId] = await knex("dishes").insert({
      name,
      description,
      category,
      price,
      image: savedFilename,
      created_by: userId,
      updated_by: userId,
    });

    const ingredientsData = ingredientList.map((ingredient) => ({
      dish_id: newDishId,
      name: ingredient,
      created_by: userId,
    }));

    await knex("ingredients").insert(ingredientsData);

    return response.json({ message: "Dish created successfully!" });
  }

  // METHOD TO FETCH A DISH BY ID
  async index(request, response) {
    const { id } = request.params;

    const dish = await knex("dishes").where({ id }).first();
    const ingredients = await knex("ingredients")
      .where({ dish_id: id })
      .orderBy("name");

    if (!dish) {
      throw new AppError("Dish not found.", 404);
    }

    return response.json({
      ...dish,
      ingredients,
    });
  }

  // METHOD TO DELETE A DISH BY ID
  async delete(request, response) {
    const { id } = request.params;

    const dish = await knex("dishes").where({ id }).first();

    if (!dish) {
      throw new AppError("Dish not found.", 404);
    }

    await knex("dishes").where({ id }).delete();

    return response.json({ message: "Dish deleted successfully!" });
  }

  // METHOD TO UPDATE A DISH BY ID
  async update(request, response) {
    const { id } = request.params;
    const { name, description, category, price, ingredients } = request.body;
    const imageFile = request.file?.filename;

    const existingDish = await knex("dishes").where({ id }).first();

    if (!existingDish) {
      throw new AppError("Dish not found.", 404);
    }

    const updateData = {
      name: name || existingDish.name,
      description: description || existingDish.description,
      category: category || existingDish.category,
      price: price || existingDish.price,
      updated_by: request.user.id,
      updated_at: knex.fn.now(),
    };

    if (imageFile) {
      const diskStorage = new DiskStorage();

      if (existingDish.image) {
        await diskStorage.deleteFile(existingDish.image);
      }

      const newFilename = await diskStorage.saveFile(imageFile);
      updateData.image = newFilename;
    }

    if (ingredients) {
      await knex("ingredients").where({ dish_id: id }).delete();

      const ingredientsData = ingredients.map((ingredient) => ({
        dish_id: id,
        name: ingredient,
        created_by: request.user.id,
      }));

      await knex("ingredients").insert(ingredientsData);
    }

    await knex("dishes").where({ id }).update(updateData);

    return response.json({ message: "Dish updated successfully!" });
  }

  // METHOD TO LIST DISHES WITH OPTIONAL SEARCH
  async listDishes(request, response) {
    const { search } = request.query;
    let dishesQuery = knex("dishes")
      .select([
        "dishes.id",
        "dishes.name",
        "dishes.description",
        "dishes.category",
        "dishes.price",
        "dishes.image",
      ])
      .orderBy("dishes.name");

    if (search) {
      const keywords = search.split(" ").map((keyword) => `%${keyword}%`);
      dishesQuery = dishesQuery
        .leftJoin("ingredients", "dishes.id", "ingredients.dish_id")
        .where((builder) => {
          builder.where((subBuilder) => {
            keywords.forEach((keyword) => {
              subBuilder.orWhere("dishes.name", "like", keyword);
              subBuilder.orWhere("dishes.description", "like", keyword);
            });
          });
          keywords.forEach((keyword) => {
            builder.orWhere("ingredients.name", "like", keyword);
          });
        })
        .groupBy("dishes.id");
    }

    const dishes = await dishesQuery;
    const ingredients = await knex("ingredients");

    const dishesWithIngredients = dishes.map((dish) => {
      const dishIngredients = ingredients.filter(
        (ingredient) => ingredient.dish_id === dish.id
      );

      return {
        ...dish,
        ingredients: dishIngredients,
      };
    });

    return response.json(dishesWithIngredients);
  }
}

module.exports = DishesController;

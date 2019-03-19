const slugify = require("@sindresorhus/slugify");

const Mutations = {
  async createProject(parent, args, ctx, info) {
    // TODO: Check if they are logged in
    // Create slug
    args.slug = slugify(args.title);

    return ctx.db.mutation.createProject(
      {
        data: {
          ...args
        }
      },
      info
    );
  },

  async updateProject(parent, args, ctx, info) {
    // first take a copy of the updates
    const updates = { ...args };
    //remove the ID from the updates
    delete updates.id;
    // run the update method
    return ctx.db.mutation.updateProject(
      {
        data: updates,
        where: {
          id: args.id
        }
      },
      info
    );
  }

  // async createCategory(parent, args, ctx, info) {
  //   // TODO: Check if they are logged in
  //   // TODO: Check if the logged in user has permission to create categories

  //   const category = await ctx.db.mutation.createCategory(
  //     {
  //       data: {
  //         ...args
  //       }
  //     },
  //     info
  //   );

  //   console.log(category);

  //   return category;
  // }
};

module.exports = Mutations;

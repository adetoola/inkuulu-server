const slugify = require("@sindresorhus/slugify");

const Mutations = {
  async createProject(parent, args, ctx, info) {
    // TODO: Check if they are logged in
    // Create slug
    args.slug = slugify(args.name);

    const project = await ctx.db.mutation.createProject(
      {
        data: {
          ...args
        }
      },
      info
    );

    return project;
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

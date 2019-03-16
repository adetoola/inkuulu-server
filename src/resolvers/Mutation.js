const Mutations = {
  async createProject(parent, args, ctx, info) {
    // TODO: Check if they are logged in

    const project = await ctx.db.mutation.createProject(
      {
        data: {
          ...args
        }
      },
      info
    );

    console.log(project);

    return project;
  }
};

module.exports = Mutations;

const { forwardTo } = require("prisma-binding");

const Query = {
  projects: forwardTo("db"),
  project: forwardTo("db"),
  projectsConnection: forwardTo("db"),
  users: forwardTo("db"),
  user: forwardTo("db"),
  categories: forwardTo("db"),
  category: forwardTo("db"),
  async me(parent, args, ctx, info) {
    if (!ctx.request.userId) return null;

    return ctx.db.query.user(
      {
        where: {
          id: ctx.request.userId
        }
      },
      info
    );
  },
  async myProjects(parent, args, ctx, info) {
    if (!ctx.request.userId) return null;

    return ctx.db.query.projects(
      {
        where: {
          owner: {
            id: ctx.request.userId
          }
        }
      },
      info
    );
  }
};

module.exports = Query;

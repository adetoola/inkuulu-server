const { forwardTo } = require("prisma-binding");

const Query = {
  projects: forwardTo("db")
  // async projects(parent, args, ctx, info) {
  //   console.log('Getting Projects!!');
  //   const projects = await ctx.db.query.projects();
  //   return projects;
  // },
};

module.exports = Query;

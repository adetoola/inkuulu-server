const slugify = require("@sindresorhus/slugify");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
  },

  async createCategory(parent, args, ctx, info) {
    // TODO: Check if they are logged in
    // TODO: Check if the logged in user has permission to create categories
    // Create slug
    args.slug = slugify(args.title);
    return ctx.db.mutation.createCategory(
      {
        data: {
          ...args
        }
      },
      info
    );
  },
  async signup(parent, args, ctx, info) {
    args.email = args.email.toLowerCase();
    const password = await bcrypt.hash(args.password, 10);
    const user = ctx.db.mutation.createUser({ data: { ...args, password, permissions: { set: ["USER"] } } }, info);
    // return the JWT Token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // set jwt as cookie on response
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 180 // 6 months
    });

    return user;
  }
};

module.exports = Mutations;

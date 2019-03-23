const slugify = require("@sindresorhus/slugify");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomBytes } = require("crypto");
const { promisify } = require("util");
const EmailService = require("../services/EmailService");
const { makeANiceEmail, transport } = require("../mail");

const Mutations = {
  async createProject(parent, args, ctx, info) {
    if (!ctx.request.userId) throw new Error("You must be logged in to do that!!!");

    // Create slug
    args.slug = slugify(args.title);
    // Slice category
    const categoryId = args.category;
    delete args.category;

    return ctx.db.mutation.createProject(
      {
        data: {
          owner: {
            connect: {
              id: ctx.request.userId
            }
          },
          category: {
            connect: {
              id: categoryId
            }
          },
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
    const user = await ctx.db.mutation.createUser(
      { data: { ...args, password, permissions: { set: ["USER"] } } },
      info
    );

    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

    // set jwt as cookie on response
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 180 // 6 months
    });

    return user;
  },
  async signin(parent, { email, password }, ctx, info) {
    //1. User with email
    const user = await ctx.db.query.user({
      where: { email: email.toLowerCase() }
    });
    if (!user) throw new Error("Email or password is incorrect!");
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Email or password is incorrect!");
    // TODO: Verfiy account
    // if (!user.isVerified) throw new Error("Verify your account");
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

    // set jwt as cookie on response
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 180 // 6 months
    });

    return user;
  },
  async signout(parent, args, ctx, info) {
    ctx.response.clearCookie("token");
    return { message: "User Successfully logged out!" };
  },

  async requestReset(parent, args, ctx, info) {
    // 1. check if real user
    const user = await ctx.db.query.user({ where: { email: args.email } });
    if (!user) throw new Error(`No user with the email ${args.email}`);

    // 2. set a reset token and expiry on user
    const promisifiedRandomBytes = promisify(randomBytes);
    const resetToken = (await promisifiedRandomBytes(20)).toString("hex");
    const resetTokenExpiry = (await Date.now()) + 3600000; // 1 hour from now
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry }
    });

    // 3. email them the reset
    const mailRes = await transport.sendMail({
      from: "hello@inkuluu.com",
      to: user.email,
      subject: "Your Password Reset Token",
      html: makeANiceEmail(`YOur Password Reset Token is here!!!
      \n\n
      <a href="${process.env.FRONTEND_URL}/reset/${resetToken}">Click here to reset.</a>`)
    });
    return {
      message: "Email has been sent!"
    };

    // Alternative for production
    // const text = `YOur Password Reset Token is here!!!
    //   \n\n
    //   <a href="${process.env.FRONTEND_URL}/reset/${resetToken}">Click here to reset.</a>`;

    // return EmailService.sendEmail(user.email, "Your Password Reset Token", text)
    //   .then(() => {
    //     return {
    //       message: "Email has been sent!"
    //     };
    //   })
    //   .catch(err => {
    //     console.log(err);
    //     throw new Error("Unable to send Email! Try again.");
    //   });
  },

  async resetPassword(parent, args, ctx, info) {
    // 1. check if password match
    if (args.password !== args.confirmPassword) throw new Error("Password don't match");
    // 2. check if token is legit
    // 3. check if expired
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000
      }
    });
    if (!user) throw new Error("This token is either invalid or expired.");
    // 4. hash new passwor
    const password = await bcrypt.hash(args.password, 10);
    // 5. save new password to user
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null
      }
    });
    // 6. generate jwt
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
    // 7. set jwt cookie
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 180 // 6 months
    });
    // 8. return new user
    console.log(updatedUser);
    return updatedUser;
  }
};

module.exports = Mutations;

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function getUser(username) {
  const user = await prisma.Users.findUnique({
    where: {
      username: username,
    },
  });
  return user;
}

async function getUserById(id) {
  const user = await prisma.Users.findUnique({
    where: {
      id: id,
    },
  });

  return user;
}

async function createUser(username, password) {
  const user = await prisma.Users.create({
    data: {
      username: username,
      password: password,
    },
  });
}

module.exports = {
  getUser,
  getUserById,
  createUser,
};

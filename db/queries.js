const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function getUser(username) {
  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });
  return user;
}

async function getUserById(id) {
  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });

  return user;
}

module.exports = {
  getUser,
  getUserById,
};

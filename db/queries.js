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

async function setAdmin(id) {
  const updateUser = await prisma.Users.update({
    where: {
      id: id,
    },
    data: {
      role: "ADMIN",
    },
  });
}

async function createFolder(userid, name) {
  const createFolder = await prisma.Folder.create({
    data: {
      name: name,
      user: {
        connect: {
          id: userid,
        },
      },
    },
  });
}

async function getFolders(user) {
  if (user) {
    const folders = await prisma.Folder.findMany({
      where: {
        usersId: user.id,
      },
    });

    return folders;
  }
}

async function getFolderID(folderName, userID) {
  const folder = await prisma.Folder.findFirst({
    where: {
      usersId: userID,
      name: folderName,
    },
  });
  return folder.id;
}

async function uploadFile(userID, folderName, file) {
  const folderID = await getFolderID(folderName, userID);
  console.log(folderID);
  const uploadFile = await prisma.file.create({
    data: {
      name: file,
      size: 10,
      Folder: {
        connect: {
          id: folderID,
        },
      },
    },
  });
}

module.exports = {
  getUser,
  getUserById,
  createUser,
  setAdmin,
  createFolder,
  getFolders,
  uploadFile,
  getFolderID,
};

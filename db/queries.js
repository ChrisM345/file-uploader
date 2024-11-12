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

async function isUnique(folderName, userID) {
  const folder = await prisma.Folder.findFirst({
    where: {
      usersId: userID,
      name: folderName,
    },
  });
  return folder;
}

async function uploadFile(userID, folderName, fileName, URL, fileSize) {
  const folderID = await getFolderID(folderName, userID);
  console.log(folderID);
  const uploadFile = await prisma.file.create({
    data: {
      name: fileName,
      size: fileSize,
      url: URL,
      Folder: {
        connect: {
          id: folderID,
        },
      },
    },
  });
}

async function getFiles(folderName, userID) {
  const folderId = await getFolderID(folderName, userID);
  const files = await prisma.file.findMany({
    where: {
      folderId: folderId,
    },
  });

  // console.log(files);
  return files;
}

async function deleteFolder(folderName, userID) {
  const folderId = await getFolderID(folderName, userID);

  const deleteFiles = prisma.file.deleteMany({
    where: {
      folderId: folderId,
    },
  });

  const deleteFolder = prisma.folder.delete({
    where: {
      id: folderId,
    },
  });

  const transaction = await prisma.$transaction([deleteFiles, deleteFolder]);
}

async function deleteFile(fileID) {
  const deleteFile = await prisma.file.delete({
    where: {
      id: fileID,
    },
  });
}

async function renameFolder(folderName, newFolderName, userID) {
  const folderId = await getFolderID(folderName, userID);
  const folder = await prisma.Folder.update({
    where: {
      id: folderId,
    },
    data: {
      name: newFolderName,
    },
  });
}

async function getFileId(folderId, fileName) {
  const fileId = await prisma.file.findFirst({
    where: {
      folderId: folderId,
      name: fileName,
    },
  });

  return fileId.id;
}

async function updateFileURLs(folderName, userID, fileName, newURL) {
  const folderId = await getFolderID(folderName, userID);
  const fileId = await getFileId(folderId, fileName);
  const file = await prisma.file.update({
    where: {
      id: fileId,
    },
    data: {
      url: newURL,
    },
  });
}

async function getFile(folderName, userID, fileName) {
  const folderId = await getFolderID(folderName, userID);
  const file = await prisma.file.findFirst({
    where: {
      folderId: folderId,
      name: fileName,
    },
  });
  return file;
}

async function renameFile(fileID, fileName) {
  const file = await prisma.file.findUnique({
    where: {
      id: fileID,
    },
  });

  const ext = file.name.split(".")[1];
  let originalURL = file.url.split("/");
  originalURL.pop();
  originalURL = originalURL.join("/") + `/${fileName}.${ext}`;
  console.log(originalURL);
  const renameFile = await prisma.file.update({
    where: {
      id: fileID,
    },
    data: {
      name: `${fileName}.${ext}`,
      url: originalURL,
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
  getFiles,
  isUnique,
  deleteFolder,
  deleteFile,
  renameFolder,
  updateFileURLs,
  getFile,
  renameFile,
};

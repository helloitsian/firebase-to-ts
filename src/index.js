import fs from "fs";
import jsonToTs from "json-to-ts";
import _ from "lodash";
const { writeFile } = fs.promises;

const getCollections = async (firestore) => {
  const collections = await firestore.listCollections();
  const collectionIds = collections.map((col) => col.id);

  return collectionIds;
};

const getDocuments = async (firestore, collections) => {
  const requests = collections.map(async (coll) => {
    const querySnapshot = await firestore.collection(coll).limit(1).get();
    if (!querySnapshot.empty) {
      const docSnapshot = querySnapshot.docs[0];
      const data = await querySnapshot.docs[0].data();
      data.collection = coll;
      return data;
    }
  });
  return await Promise.all(requests);
};

const prepareDoc = (doc) => {
  let name = doc.collection;
  if (name[name.length - 1].toLowerCase() === "s") name = name.slice(0, -1);
  name = name.split("");
  name[0] = name[0].toUpperCase();
  name = name.join();

  const withoutColl = _.omit(doc, ["collection"]);
  const prepared = {
    ...withoutColl,
  };
  return [prepared, name];
};

const convertDocToInterface = async (docs) => {
  const jsonDocs = docs.reduce((obj, doc) => {
    const [prepared, name] = prepareDoc(doc);
    obj[name] = prepared;
    return obj;
  }, {});
  return await jsonToTs(jsonDocs);
};

const generateTsInterfaces = async (firestore, options = {}) => {
  try {
    const collections = await getCollections(firestore);
    const documents = await getDocuments(firestore, collections);
    const interfaces = await convertDocToInterface(documents);
    if (options.exportToFile) {
      const fileName = options.exportToFile.name;
      interfaces.shift();
      const fileData = interfaces.reduce((str, curr) => `${str}\n${curr}`, "");
      try {
        await writeFile(fileName, fileData); // need to be in an async function
      } catch (error) {
        console.log(error);
      }
    }
    console.log(interfaces);
    return interfaces;
  } catch (err) {
    console.error(err);
  }
};

export default generateTsInterfaces;

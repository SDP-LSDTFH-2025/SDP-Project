import { promises as fs } from 'fs';
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


export default async () => {
  const filePathToDelete = await path.join(__dirname,"./state/storageState.json");
	try {
		await fs.rm(filePathToDelete);
		console.log(`File deleted: ${filePathToDelete}`);
	} catch (error) {
		console.error(`Error deleting file ${filePathToDelete}:`, error);
	}
};

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const DSN = process.env.DSN;
export const PORT = process.env.PORT;
export const SECRET_KEY = process.env.SECRET_KEY;
export const DOMAIN = process.env.DOMAIN;
export const TEST_PORT = process.env.TEST_PORT;
export const NODE_ENV = process.env.NODE_ENV;
export const TEST_DSN = process.env.TEST_DSN;


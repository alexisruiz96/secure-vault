//https://stackoverflow.com/questions/42182577/is-it-possible-to-use-dotenv-in-a-react-project

const AUTHENTICATION_PREFIX = process.env.REACT_APP_AUTHENTICATION_PREFIX as string;
const ENCRYPTION_PREFIX = process.env.REACT_APP_ENCRYPTION_PREFIX as string;

export const prefixSubKeys = {
    authKey: AUTHENTICATION_PREFIX,
    encKey: ENCRYPTION_PREFIX,
};

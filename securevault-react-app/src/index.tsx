import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { SecureVaultClient } from 'secure-vault-client';
import { prefixSubKeys } from "./modules/config";


const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
    );
    root.render(
        <React.StrictMode>
        <App />
    </React.StrictMode>
);

export const secureVault = new SecureVaultClient({
    apiOptions: {baseUrl: 'http://localhost:4000', timeout: 30000},
    keyPrefixes: prefixSubKeys,
    cryptoOptions: {format: 'raw', algorithm:'AES-GCM'}}
);
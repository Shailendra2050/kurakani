import { Platform } from "react-native"; 

const Host = Platform.select({
    ios: "10.234.36.226",
    android: "10.234.36.226",
    default: "localhost"
});

export const API_BASE_URL = `http://${Host}:3000`;
export const WS_BASE_URL = `ws://${Host}:3000`;
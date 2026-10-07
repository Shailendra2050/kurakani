import { Platform } from "react-native"; 

const Host = Platform.select({
    ios: "192.168.101.7",
    android: "192.168.101.7",
    default: "localhost"
});

export const API_BASE_URL = `http://${Host}:3000`;
export const WS_BASE_URL = `ws://${Host}:3000`;
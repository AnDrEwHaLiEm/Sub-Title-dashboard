import axios from "axios";


const apisConfig = {
    baseURL: "http://192.168.1.13:8080",
    timeout: 500000,
    headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
    },
}

const axiosApis = axios.create(apisConfig)


export { axiosApis }

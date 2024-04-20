import axios from "axios";


const apisConfig = {
    baseURL: "http://localhost:8080",
    timeout: 500000,
    headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
    },
}

const axiosApis = axios.create(apisConfig)


export { axiosApis }

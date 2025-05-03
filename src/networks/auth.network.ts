import axiosClient from "@/lib/axiosClient";

export const apiGetLogin =  async (body = {}) => {
    console.log(body)
    const response = await axiosClient.post('/login', body);
    console.log(response)
    return response.data;
}
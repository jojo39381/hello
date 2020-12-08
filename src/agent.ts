import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

/***********************
 *    Agent Helpers    *
/***********************/
// const slug = "kyoukgio";
const slug = "q4qyvnpb";
const API_ROOT = `https://${slug}.brev.dev/api`;

const responseBody = (res: AxiosResponse) => res.data;

const makeEndpointCall = (url: string) => {
  return `${API_ROOT}${url}`;
};

const authAxios = axios.create();
type TokenGetter = () => Promise<string | null>;
const makeBearerToken = (token: string) => `Bearer ${token}`;
const configRequestAuth = (getAccessToken: TokenGetter) => {
  authAxios.interceptors.request.use(
    async (config: AxiosRequestConfig) => {
      const token = await getAccessToken();
      if (token != null) {
        config.headers.authorization = makeBearerToken(token);
      } else {
        console.warn("canceling network call");
        config = {
          ...config,
          cancelToken: new axios.CancelToken((cancel) =>
            cancel("Cancel unauthorized request")
          ),
        };
      }

      return config;
    },
    (error: any) => {
      return Promise.reject(error);
    }
  );

  authAxios.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error: AxiosError) => {
      if (error.response) {
        if (error.response.status === 401) {
          console.log("user authentication error");
        }
        return Promise.reject(error.response);
      } else if (error.request) {
        console.log(
          "The request was made but no response was received",
          error.request
        );
      } else {
        console.log(
          "Something happened in setting up the request that triggered an Error"
        );
      }
      return Promise.reject(error);
    }
  );
};

const openRequests = {
  del: (url: string) => axios.delete(makeEndpointCall(url)).then(responseBody),
  get: (url: string) => axios.get(makeEndpointCall(url)).then(responseBody),
  post: (url: string, data?: any) =>
    axios.post(makeEndpointCall(url), data).then(responseBody),
  put: (url: string, data?: any) =>
    axios.put(makeEndpointCall(url), data).then(responseBody),
};
const authRequests = {
  del: (url: string) =>
    authAxios.delete(makeEndpointCall(url)).then(responseBody),
  get: (url: string) => authAxios.get(makeEndpointCall(url)).then(responseBody),
  post: (url: string, data?: any) =>
    authAxios.post(makeEndpointCall(url), data).then(responseBody),
  put: (url: string, data?: any) =>
    authAxios.put(makeEndpointCall(url), data).then(responseBody),
};

const cotterAuthRequests = (cotter: any) => {
  return {
    del: async (url: string) => {
      const accessToken = await cotter.tokenHandler.getAccessToken();
      return axios.delete(makeEndpointCall(url), {
        headers: {
          'Authorization': `Bearer ${accessToken.token}` 
        }
      }).then(responseBody)
    },
    get: async (url: string) => {
      const accessToken = await cotter.tokenHandler.getAccessToken();
      return axios.get(makeEndpointCall(url), {
        headers: {
          'Authorization': `Bearer ${accessToken.token}` 
        }
      }).then(responseBody)
    },
    post: async (url: string, data?: any) => {
      const accessToken = await cotter.tokenHandler.getAccessToken();
      return axios.post(makeEndpointCall(url), data, {
        headers: {
          'Authorization': `Bearer ${accessToken.token}` 
        }
      }).then(responseBody)
    },
    put: async (url: string, data?: any) => {
      const accessToken = await cotter.tokenHandler.getAccessToken();
      return axios.put(makeEndpointCall(url), data, {
        headers: {
          'Authorization': `Bearer ${accessToken.token}` 
        }
      }).then(responseBody)
    }
  }
}

const ping = {
  get: () =>
    axios
      .get(`https://${slug}.brev.dev/_api/ping`)
      .then(responseBody) as Promise<any>,
};

/***********************
 *  Server Resources   *
 ***********************/
interface IUser {
  name: string;
  email: string;
  token: string;
}
interface IUsers {
  users: IUser[];
}
const Users = {
  get: () => openRequests.get("/users") as Promise<IUsers>,
  verify: (clientID: string) => openRequests.get(`/users?user=${clientID}`) as Promise<IUsers>,
  post: (data?: any) => openRequests.post("/users", data) as Promise<IUser>,
};

const SecuredResource = {
  get: () => authRequests.get("/misc") as Promise<any>,
};

const Cards = {
  post: (card: any) => authRequests.post("/cards", card) as Promise<any>,
}

export default {
  configRequestAuth,
  SecuredResource,
  authRequests,
  cotterAuthRequests,
  openRequests,
  Users,
  Cards,
  ping, // you can remove this after the tutorial
};

import Cotter from "cotter";
// import agent from "../../agent";
import { COTTER_API_KEY_ID } from "../../apiKeys";
import agent from "../../agent";

const apiKeyID = COTTER_API_KEY_ID;

const getCotter = (config) => {
  if (config && config.ApiKeyID) {
    const c = new Cotter(config);
    return c;
  } else {
    const c = new Cotter(apiKeyID);
    return c;
  }
};

const authProvider = {
  // called when the user attempts to log in
  login: ({ username }) => {
    console.log("loginnnnnn");
    localStorage.setItem("username", username);
    // accept all username/password combinations
    return Promise.resolve();
  },
  // called when the user clicks on the logout button
  logout: async () => {
    if (apiKeyID) {
      const cotter = getCotter();
      await cotter.logOut();
      return Promise.resolve();
    } else {
      throw new Error(
        "ApiKeyID is undefined, you may forgot to wrap your component in <CotterProvider>"
      );
    }
  },
  // called when the API returns an error
  checkError: ({ status }) => {
    if (status === 401 || status === 403) {
      localStorage.removeItem("username");
      return Promise.reject();
    }
    return Promise.resolve();
  },
  // called when the user navigates to a new location, to check for authentication
  checkAuth: async () => {
    const cotter = getCotter();
    const accessToken = await cotter.tokenHandler.getAccessToken();
    if (accessToken && accessToken.token?.length > 0) {
      const usr = cotter.getLoggedInUser();
      //   setuser(usr);
      agent.configRequestAuth(() => accessToken.token);
      try {
        await agent.Users.verify(usr.client_user_id);
        return Promise.resolve();
      } catch {
        return Promise.reject();
      }
    } else {
      // setuser(undefined);
      return Promise.reject();
    }
  },
  // called when the user navigates to a new location, to check for permissions / roles
  getPermissions: async () => {
    const cotter = getCotter();

    const accessToken = await cotter.tokenHandler.getAccessToken();

    if (accessToken && accessToken.token?.length > 0) {
      const usr = cotter.getLoggedInUser();
      // setuser(usr);
      agent.configRequestAuth(() => accessToken.token);
      try {
        await agent.Users.verify(usr.client_user_id);
        return Promise.resolve();
      } catch {
        return Promise.reject();
      }
    } else {
      // setuser(undefined);
      return Promise.reject();
    }
  },
};

export { authProvider };

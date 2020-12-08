import { stringify } from "query-string";
import agent from "./agent";
import Cotter from "cotter";
import { COTTER_API_KEY_ID } from "./apiKeys";

const getCotter = (config) => {
  if (config && config.ApiKeyID) {
    const c = new Cotter(config);
    return c;
  } else {
    const c = new Cotter(COTTER_API_KEY_ID);
    return c;
  }
};

const cotter = getCotter();
const httpClient = agent.cotterAuthRequests(cotter);

const buildQueryParams = (params) => {
  return new URLSearchParams(params).toString();
};

const dataProvider = {
  getList: (resource, params) => {
    let url = `/${resource}`;
   
    // let url = "https://dev-th8dapos.brev.dev/api"

    const paramsUsed = {};
    
    if (params?.filter?.cardID !== undefined) {
      paramsUsed.filter = params?.filter?.cardID;
    }

    
    if (params?.filter?.startDate !== undefined) {
     
      
      paramsUsed.startDate = params?.filter?.startDate
      
      console.log(paramsUsed)
      
    }
    if (params?.filter?.endDate !== undefined) {
      
        paramsUsed.endDate = params?.filter?.endDate

     
      // paramsUsed.endDate = params?.filter?.endDate;
    }








    if (params?.filter?.budtender_name !== undefined) {
     
      
      paramsUsed.budtender_name = params?.filter?.budtender_name
      
      console.log(paramsUsed)
      
    }

    if (params?.filter?.store_name !== undefined) {
     
      
      paramsUsed.store_name = params?.filter?.store_name
      
      console.log(paramsUsed)
      
    }
    

    if (params?.pagination !== undefined) {
      paramsUsed.page = params.pagination.page;
      paramsUsed.pageSize = params.pagination.perPage;
    }
    
    const paramsStr = buildQueryParams(paramsUsed);
   
    if (Object.keys(paramsUsed).length > 0) {
      url += "?" + paramsStr;
    }
    console.log(url)
    return httpClient.get(url).then((json) => {

      return {
        data: json.data,
        total: json.total,
      };
    });
  },

  getOne: (resource, params) => {
    
    return httpClient.get(`/${resource}?id=${params.id}`).then((json) => {
      
      return {
        data: json.data[0],
      };
    });
  },

  getMany: (resource, params) => {
    const url = `/${resource}?filter=${params.ids[0]}`;
   
   
    return httpClient.get(url).then((json) => {
     
      return {
        data: json.data,
        total: json.total,
      };
    });
  },

  getManyReference: (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const query = {
      sort: JSON.stringify([field, order]),
      range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
      filter: JSON.stringify({
        ...params.filter,
        [params.target]: params.id,
      }),
    };
    const url = `/${resource}?${stringify(query)}`;

    return httpClient.get(url).then((json) => ({
      data: json,
    }));
  },

  update: (resource, params) =>
    httpClient
      .put(`/${resource}?resource_id=${params.id}`, JSON.stringify(params.data))
      .then((json) => ({ data: json })),

  create: (resource, params) =>
    httpClient
      .post(`/${resource}`, JSON.stringify(params.data))
      .then((json) => ({
        data: { ...params.data, id: json.id },
      })),

  deleteOne: (resource, params) =>
    httpClient.del(`/${resource}?id=${params.id}`).then((json) => {
      return {
        data: json.data,
      };
    }),

  deleteMany: (resource, params) => {
    return httpClient.del(`/${resource}?id=${params.ids[0]}`).then((json) => {
      return {
        data: json.data,
        total: json.total,
      };
    });
  },
};

export default {
  dataProvider,
};

import api from "./api";

export const getInstrumentTypes = async () => {
  const response = await api.get(
    "/income-receivables/instrument-types"
  );
  return response.data;
};

export const calculateIncomeReceivable = async (calDate, noOfDays) => {
  const response = await api.get(
    `/income-receivables/calculate`,
    {
      params: {
        calDate,
        noOfDays,
      },
    }
  );
  return response.data;
};

export const saveIncomeReceivable = async (data) => {
  const response = await api.post("/income-receivables/save", data);
  return response.data;
};


export const getFundDropdown = async () => {
  const response = await api.get("/funds/dropdown");
  return response;
}


export const getCompanies = async (u_date, sect_maj_cd, fund_cd = "") => {
  let url = `/income-receivables/comps?u_date=${u_date}&sect_maj_cd=${sect_maj_cd}`;
  if (fund_cd) url += `&fund_cd=${fund_cd}`;
  
  const response = await api.get(url); // assuming `api` is axios instance
  return response.data; // always return array
};
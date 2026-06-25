import api from "./api";

export const getCalDateDropdown = async (receivableInstrumentType) => {
  const response = await api.get(
    "/income-receivable-vouchers/cal-date-dropdown",
    {
      params: { receivableInstrumentType },
    }
  );
  return response.data;
};

export const getEditDeleteCalDateDropdown = async (receivableInstrumentType) => {
  const response = await api.get(
    "/income-receivable-vouchers/edit-delete-cal-date-dropdown",
    {
      params: { receivableInstrumentType },
    }
  );
  return response.data;
};


export const calculateIncomeReceivableVoucherGrid = async (calDate, receivableInstrumentType) => {
  const response = await api.get(
    `/income-receivable-vouchers/calculate`,
    {
      params: {
		calDate,
		receivableInstrumentType,
      },
    }
  );
  return response.data;
};


export const calculateIncomeReceivableEditDeleteGrid = async (calDate, receivableInstrumentType) => {
  const response = await api.get(
    `/income-receivable-vouchers/edit-delete-calculate`,
    {
      params: {
		calDate,
		receivableInstrumentType,
      },
    }
  );
  return response.data;
};

export const getFundDropdownForVoucher = async (calDate,receivableInstrumentType) => {
  const response = await api.get("income-receivable-vouchers/fund-dropdown-by-date",
	{
	  params: {
		calDate,
    receivableInstrumentType
	  },
	}
  );
  return response;
}

export const getEditDeleteFundDropdown = async (calDate) => {
  const response = await api.get("income-receivable-vouchers/edit-delete-fund-dropdown-by-date",
	{
	  params: {
		calDate,
	  },
	}
  );
  return response;
}


export const getCompaniesForVoucher = async (caldate,fundCd,receivableInstrumentType) => {

	const response = await api.get(`/income-receivable-vouchers/company-dropdown`,
	{
		params: {
			caldate,
			fundCd,
      receivableInstrumentType
		},
	}
	);


  return response.data; // always return array
};


export const getEditDeleteCompanies = async (caldate,fundCd) => {

	const response = await api.get(`/income-receivable-vouchers/edit-delete-company-dropdown`,
	{
		params: {
			caldate,
			fundCd,
		},
	}
	);


  return response.data; // always return array
};

export const saveIncomeReceivableVoucher = async (data,voucher_entry_by) => {
  const response = await api.post("/income-receivable-vouchers/save", data , { params: { voucher_entry_by } });
  return response.data;
};


export const saveEditDeleteIncomeReceivableVoucher = async (data,editDeleteEntryBy,updateType) => {
  const response = await api.post("/income-receivable-vouchers/save-edit-delete", data , { params: {editDeleteEntryBy, updateType } });
  return response.data;
};

export const incomeReceivableReports = async (receivableInstrumentType,startDate,endDate) => {
  const response = await api.get("/income-receivable-vouchers/report", { params: {receivableInstrumentType, startDate, endDate }});
  return response.data;
};


export const getReportFundDropdown = async (startDate,endDate,receivableInstrumentType) => {
  const response = await api.get("income-receivable-vouchers/report-fund-dropdown",
	{
	  params: {
    startDate,
    endDate,
    receivableInstrumentType
	  },
	}
  );
  return response;
}


export const getReportCompanies = async (startDate,endDate,fundCd,receivableInstrumentType) => {

  const response = await api.get(`/income-receivable-vouchers/report-company-dropdown`,
  {
    params: {
      startDate,
      endDate,
      fundCd,
      receivableInstrumentType
    },
  }
  );


  return response.data; // always return array
}


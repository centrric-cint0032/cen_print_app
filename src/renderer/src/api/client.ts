// --- API Methods ---

export interface AppSettingsResponse {
  message: {
    company_name: string;
    default_template: string;
  }
}

export interface SearchItem {
  item_code: string;
  item_name: string;
  item_group: string;
}

export interface SearchItemsResponse {
  message: SearchItem[];
}

export const configureClient = (baseUrl: string) => {
  // No-op: The main process IPC proxy reads the baseUrl directly from settings.
};

const proxyRequest = async (config: any) => {
  // @ts-ignore
  const result = await window.api.proxyRequest(config);
  if (!result.success) {
    throw new Error(result.error);
  }
  return { data: result.data };
};

export const getAppSettings = async (): Promise<AppSettingsResponse> => {
  const response = await proxyRequest({
    method: 'GET',
    url: '/api/method/cen_pos_barcode_config.desktop_printer.api.get_app_settings'
  });
  return response.data;
};

export const searchItems = async (searchKey: string, limitStart = 0, limitPageLength = 20): Promise<SearchItemsResponse> => {
  const response = await proxyRequest({
    method: 'GET',
    url: '/api/method/cen_pos_barcode_config.desktop_printer.api.search_items',
    params: {
      search_key: searchKey,
      limit_start: limitStart,
      limit_page_length: limitPageLength
    }
  });
  return response.data;
};

export interface PrintPayloadResponse {
  message: {
    item_code: string;
    item_name: string;
    item_group: string;
    standard_selling_rate: number;
    template: string;
  }
}

export const getPrintPayload = async (itemCode: string, templateName: string): Promise<PrintPayloadResponse> => {
  const response = await proxyRequest({
    method: 'GET',
    url: '/api/method/cen_pos_barcode_config.desktop_printer.api.get_print_payload',
    params: {
      item_code: itemCode,
      template_name: templateName
    }
  });
  return response.data;
};

export const loginToERP = async (usr: string, pwd: string) => {
  // @ts-ignore
  const result = await window.api.loginRequest({ usr, pwd });
  if (!result.success) throw new Error(result.error);
  return result.data;
};

export const checkAuthStatus = async () => {
  // @ts-ignore
  return await window.api.checkAuth();
};

export const logoutFromERP = async () => {
  // @ts-ignore
  return await window.api.logoutRequest();
};

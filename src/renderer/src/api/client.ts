import axios from 'axios';

// Create a configured axios instance
export const erpClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Dynamically configure this after reading settings from Electron
export const configureClient = (baseUrl: string) => {
  // Ensure baseUrl doesn't end with a slash for consistent joining
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  erpClient.defaults.baseURL = cleanBaseUrl;
};

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

/**
 * Step 1: App Initialization (Cold Start)
 * Fetches the company name and default template ID.
 */
export const getAppSettings = async (): Promise<AppSettingsResponse> => {
  const response = await erpClient.get('/api/method/cen_pos_barcode_config.desktop_printer.api.get_app_settings');
  return response.data;
};

/**
 * Step 2: Search Items
 * Searches ERPNext for items based on the search key.
 */
export const searchItems = async (searchKey: string, limitStart = 0, limitPageLength = 20): Promise<SearchItemsResponse> => {
  const response = await erpClient.get('/api/method/cen_pos_barcode_config.desktop_printer.api.search_items', {
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

/**
 * Step 3: Get Print Payload
 * Fetches the raw TSPL template string for a specific item.
 */
export const getPrintPayload = async (itemCode: string, templateName: string): Promise<PrintPayloadResponse> => {
  const response = await erpClient.get('/api/method/cen_pos_barcode_config.desktop_printer.api.get_print_payload', {
    params: {
      item_code: itemCode,
      template_name: templateName
    }
  });
  return response.data;
};

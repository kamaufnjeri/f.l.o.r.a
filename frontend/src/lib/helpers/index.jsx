import api from "../api"
import { toast } from "react-toastify";


export const getNumber = (pageNo, currentIndex) => {
  return (pageNo - 1) * 10 + currentIndex + 1;
} 

export const scrollBottom = (scrollRef) => {
  
  if (scrollRef && scrollRef.current) {
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }
}

const isObject = (item) => {
  return item && typeof item === 'object' && !Array.isArray(item);
}



export const postRequest = async (values, url, resetForm=null) => {
  try {
    const response = await api.post(`/${url}/`, values);

    if (response.status === 201 || response.status === 200 || response.status == 202) {
      if (resetForm) {
        resetForm();

      }
      return { success: true, error: null, data: response.data }

    } else {
      return { success: false, error: 'Unexpected error' }
    }
  } catch (error) {
    let errorMessage = 'An error occurred';

    if (error.response && error.response.data) {
      const errorData = error?.response?.data?.details || error.response.data;

      if (Array.isArray(errorData)) {
        errorMessage = errorData.join('\n');
      } else if (isObject(errorData)) {
        const errorList = [] 
        Object.entries(errorData).forEach(([key, value]) => {
          errorList.push(`${capitalizeFirstLetter(replaceDash(key))}: ${value}`)
        })
        errorMessage = errorList.join('\n');
      } else {
        errorMessage = errorData;
      }
    } else if (error.message) {
      errorMessage = error.message;
    } else {
      errorMessage = errorMessage;
    }
    
    return { success: false, error: replaceDash(errorMessage) }
  }
};

export const patchRequest = async (values, url) => {
  try {
    const response = await api.patch(`/${url}/`, values);

    if (response.status === 201 || response.status === 200 || response.status == 202) {
     
      return { success: true, error: null, data: response.data }

    } else {
      return { success: false, error: 'Unexpected error' }
    }
  } catch (error) {
    let errorMessage = 'An error occurred';

    if (error.response && error.response.data) {
      const errorData = error?.response?.data?.details || error.response.data;

      if (Array.isArray(errorData)) {
        errorMessage = errorData.join('\n');
      } else if (isObject(errorData)) {
        const errorList = [] 
        Object.entries(errorData).forEach(([key, value]) => {
          errorList.push(`${capitalizeFirstLetter(replaceDash(key))}: ${value}`)
        })
        errorMessage = errorList.join('\n');
      } else {
        errorMessage = errorData;
      }
    } else if (error.message) {
      errorMessage = error.message;
    } else {
      errorMessage = errorMessage;
    }
    
    return { success: false, error: replaceDash(errorMessage) }
  }
};


export const deleteRequest = async (url) => {
  try {
    const response = await api.delete(`/${url}/`);

    if (response.status === 204) {
     
      return { success: true, error: null, data: response.data }

    } else {
      return { success: false, error: 'Unexpected error' }
    }
  } catch (error) {
    let errorMessage = 'An error occurred';

    if (error.response && error.response.data) {
      const errorData = error?.response?.data?.details || error.response.data;

      if (Array.isArray(errorData)) {
        errorMessage = errorData.join('\n');
      } else if (isObject(errorData)) {
        const errorList = [] 
        Object.entries(errorData).forEach(([key, value]) => {
          errorList.push(`${capitalizeFirstLetter(replaceDash(key))}: ${value}`)
        })
        errorMessage = errorList.join('\n');
      } else {
        errorMessage = errorData;
      }
    } else if (error.message) {
      errorMessage = error.message;
    } else {
      errorMessage = errorMessage;
    }
    
    return { success: false, error: replaceDash(errorMessage) }
  }
};

export const getItems = async (name, filterUrl=null) => {
  let url = '';
  if (filterUrl) {
    
      url = `/${name}/${filterUrl}`;
  } else {
      url = `/${name}/`
  }
  try {
    const response = await api.get(url);
    if (response.status == 200) {
      return response.data
    } else {
      throw new Error();
    }
  }
  catch (error) {
    toast.error(`Error fetching ${name}`);
  }
}

export const getSerialNumber = async(initial_name, orgId) => {
  const data = await getItems(`${orgId}/serial_number`, `?initial_name=${initial_name}`)

  return data.serial_number
}
export const capitalizeFirstLetter = (string) => {
  if (typeof string !== 'string') return '';
  let newString = string.charAt(0).toUpperCase() + string.slice(1);
  return newString;
};

export const replaceDash= (string) => {
  if (typeof string !== 'string') return '';
  let updatedString = string.replace(/_/g, ' ');

  let newString = null;
  if (!string.includes('@')) {
     newString = string.split('.')[1]

  }
  
  if (!newString) return updatedString;
  newString = newString.replace(/_/g, ' ');
  return newString;
}


export const getQueryParams = (data) => {
  const { type, paginate = true, search = '', date = '', sortBy = '', typeValue = '' } = data;
  let queryParams = `?search=${search}&date=${date}&sort_by=${sortBy}`;

  if (type && typeValue) {
    const typeUrl = `&${type}=${typeValue}`;
    queryParams += typeUrl;
  }
  
  if (paginate) {
    const paginateParam = '&paginate=true';
    queryParams += paginateParam;
  }

  return queryParams;
};

export const invoiceBillQueryParam = (data) => {
  const { search, dueDays, status, paginate } = data;
  let queryParams = `?search=${search}&status=${status}&due_days=${dueDays}`

  if (paginate) {
    const paginate = '&paginate=true'
    queryParams = queryParams.concat(paginate)
  }
  return queryParams;
}

export const returnsQueryParams = (data) => {
  const {paginate=true, search, date, sortBy} = data;
  let queryParams = `?search=${search}&date=${date}&sort_by=${sortBy}`

  if (paginate) {
    const paginate = '&paginate=true'
    queryParams = queryParams.concat(paginate);
  }
  return queryParams;
}


export const paymentsQueryParams = (data) => {
  const {paginate=true, search, date, sortBy, type} = data;
  let queryParams = `?search=${search}&date=${date}&sort_by=${sortBy}&type=${type}`

  if (paginate) {
    const paginate = '&paginate=true'
    queryParams = queryParams.concat(paginate);
  }
  return queryParams;
}


export const togglePasswordVisibility = (setShowPassword, showPassword) => {
  setShowPassword(!showPassword);
}

export const findEntriesByType = (entries, type) => {
  if (entries) {
    const matchingEntries = entries.map((entry, index) => {
      
      
      return entry.type === type ? { entry, index } : null;
    }).filter(item => item !== null);

  return matchingEntries;
  }
  return []
};


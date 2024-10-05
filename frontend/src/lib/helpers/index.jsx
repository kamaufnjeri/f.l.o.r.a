import axios from "axios";
import { toast } from "react-toastify";

export const scrollBottom = (scrollRef) => {
  if (scrollRef.current) {
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }
}

const isObject = (item) => {
  return item && typeof item === 'object' && !Array.isArray(item);
}

const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL;

export const postRequest = async (values, url, resetForm=null) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/${url}/`, values);

    if (response.status === 201) {
      resetForm();
      return { success: true, error: null }

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
        console.log(errorData)
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
    
      url = `${BACKEND_URL}/${name}/${filterUrl}`;
  } else {
      url = `${BACKEND_URL}/${name}/`
  }
  console.log(url)
  try {
    const response = await axios.get(url);
    if (response.status == 200) {
      return response.data
    } else {
      throw new Error();
    }
  }
  catch (error) {
    toast.error(`Error': Error fetching ${name}`);
  }
}

export const getSerialNumber = async(initial_name) => {
  const data = await getItems('serial_number', `?initial_name=${initial_name}`)

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

  let newString = string.split('.')[1]

  if (!newString) return updatedString;
  newString = newString.replace(/_/g, ' ');
  return newString;
}


export const getQueryParams = (data) => {
  const {type, paginate=true, search, date, sortBy, typeValue} = data;
  let queryParams = `?search=${search}&${type}=${typeValue}&date=${date}&sort_by=${sortBy}`

  if (paginate) {
    const paginate = '&paginate=true'
    queryParams = queryParams.concat(paginate);
  }
  return queryParams;
}

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
  console.log(queryParams)

  if (paginate) {
    const paginate = '&paginate=true'
    queryParams = queryParams.concat(paginate);
  }
  return queryParams;
}
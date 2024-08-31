import axios from "axios";
import { toast } from "react-toastify";

export const scrollBottom = (scrollRef) => {
  if (scrollRef.current) {
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }
}

const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL;

export const postRequest = async (values, url, resetForm) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/${url}/`, values);

    if (response.status === 201) {
      resetForm();
      return { success: true, error: null }

    } else {
      return { success: false, error: 'Unexpected error' }
    }
  } catch (error) {
    console.log('error', error.response.data)
    let errorMessage = 'An error occurred';

    if (error.response && error.response.data) {
      const errorData = error.response.data.detail || error.response.data;

      if (Array.isArray(errorData)) {
        errorMessage = errorData.join('\n');
      } else if (errorData.non_field_errors) {
        errorMessage = errorData.non_field_errors;
      } else {
        errorMessage = errorData;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    return { success: false, error: errorMessage }
  }
};


export const getItems = async (name, filterUrl=null) => {
  let url = '';
  if (filterUrl) {
      url = `${BACKEND_URL}/${name}/${filterUrl}`;
  } else {
      url = `${BACKEND_URL}/${name}/`
  }
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

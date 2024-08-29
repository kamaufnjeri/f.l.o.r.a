import axios from "axios";

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
    console.log(error)
    let errorMessage = 'An error occurred';

    if (error.response && error.response.data) {
      const errorData = error.response.data.detail || error.response.data;

      if (Array.isArray(errorData)) {
        errorMessage = errorData.join('\n');
      } else if (errorData.non_field_errors        ) {
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

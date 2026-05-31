import { toast } from "react-toastify";
import api from "../api";

export const downloadListPDF = async (url, title) => {
    try {
        const response = await api.post(url, { title}, {
            responseType: 'blob' 
        });

        if (response.status == 200) {
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const filename = `${title}.pdf`
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } else {
            throw new Error('Unknown Error')
        }
    } catch (error) {
        console.error('Error downloading PDF:', error);
        toast.error('Error downloading pdf')
    }
};


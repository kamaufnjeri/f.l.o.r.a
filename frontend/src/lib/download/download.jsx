import { toast } from "react-toastify";
import api from "../api";

const downloadPDF = async (data, orgId, title) => {
    try {
        const response = await api.post(`/${orgId}/generate-pdf/`, { data, title }, {
            responseType: 'blob' 
        });

        const fileName = title.replace(/ /g, '_');
        if (response.status === 201 || response.status == 200) {
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${title}_report.pdf`);
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

export default downloadPDF;
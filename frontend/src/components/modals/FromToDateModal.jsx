import React from 'react';
import { Modal, Button, Form } from 'antd';
import * as Yup from 'yup'
import { Formik } from 'formik';
import DateField from '../forms/DateField.Jsx'
import { getItems, getQueryParams } from '../../lib/helpers';
import { useParams } from 'react-router-dom';


const validationSchema = Yup.object({
    from: Yup.date().required('Date is required'),
    to: Yup.date().required('Date is required'),

})

const FromToDateModal = ({ openModal, setOpenModal, setSearchItem, searchItem, setData, setPageNo, type }) => {
    const handleCancel = () => {
        setOpenModal(false);

    };
    const { orgId } = useParams();


    return (
        <>

            <Modal
                title="Custom range dates"
                open={openModal}
                onCancel={handleCancel}
                width={'50%'}
                footer={
                    <Button key="cancel" onClick={handleCancel}>
                        Cancel
                    </Button>
                }
            >
                <Formik
                    validationSchema={validationSchema}
                    initialValues={{
                        from: '',
                        to: ''
                    }}
                    onSubmit={async (values, { resetForm }) => {
                        const customRange = `${values.from}to${values.to}`
                        setSearchItem({ ...searchItem, date: customRange });
                        const queryParamsUrl = getQueryParams({
                            type: type,
                            paginate: true,
                            search: '',
                            date: customRange,
                            sortBy: searchItem.sortBy,
                            typeValue: searchItem[type]
                        })
                        const newData = await getItems(`${orgId}/${type}`, queryParamsUrl);
                        setData(newData);
                        setPageNo(1);
                        resetForm();
                        handleCancel();
                    }}
                >
                    {({ values, setFieldValue, handleSubmit, touched }) => {
                        return (
                            <Form
                                onFinish={handleSubmit}
                                className='flex flex-col gap-2'
                            >
                                <div className='flex flex-row gap-5 items-start'>
                                    <div className='flex flex-row gap-5 items-start w-full'>
                                        <label htmlFor="date" className='w-[15%]'>From</label>
                                        <DateField className='w-[80%]' value={values.from} setFieldValue={setFieldValue} name='from' />
                                    </div>
                                    <div className='flex flex-row gap-5 items-start w-full'>
                                        <label htmlFor="date" className='w-[15%]'>To</label>
                                        <DateField className='w-[80%]' value={values.to} setFieldValue={setFieldValue} name='to' />
                                    </div>
                                </div>


                                <Button type="primary" className='w-[30%] self-center' htmlType="submit">
                                    Submit
                                </Button>
                            </Form>
                        )
                    }}

                </Formik>
            </Modal>
        </>
    );
};

export default FromToDateModal;

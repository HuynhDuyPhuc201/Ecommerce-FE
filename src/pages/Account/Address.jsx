import { Button, Col, message, Row } from 'antd';
import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { userService } from '~/services/user.service';
import { setUser } from '~/config/token';
import AddressItem from '~/components/Address/AddressItem';
import useGetUserDetail from '~/hooks/useGetUserDetail';
import HelmetComponent from '~/components/Helmet';
import InputForm from '~/components/InputForm';

const Address = () => {
    const addressForm = useForm({ mode: 'onChange' });
    const [createAddress, setCreateAddress] = useState(false);
    const [loading, setLoading] = useState(false);
    const { refetch } = useGetUserDetail();

    const onSubmit = async (form) => {
        try {
            setLoading(true);
            const result = await userService.createAddress(form);
            if (result.success) {
                message.success(result.message);
                addressForm.reset({
                    houseNumber: '',
                    district: '',
                    city: '',
                    defaultAddress: false,
                });
                setUser(result.userUpdate);
                refetch();
                setCreateAddress(false); // ✅ Chỗ này không nên return
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi không xác định');
        } finally {
            setLoading(false); // ✅ Chỉ để ở đây là đủ
        }
    };

    const hanldeCreate = () => {
        setCreateAddress(true);
    };
    const handleComback = () => {
        setCreateAddress(false)
        addressForm.clearErrors();
    }

    return (
        <div className="w-full mx-auto bg-white p-6 rounded-lg shadow-md">
            <HelmetComponent title="Thông tin tài khoản" />
            <div className="flex items-center my-6 relative pb-10">
                <div className="absolute top-0 left-0">
                {createAddress && (
                    <Button icon={<ArrowLeftOutlined />} onClick={handleComback}>
                        Quay lại
                    </Button>
                )}
                </div>
                <h2 className="text-2xl font-semibold text-center flex-1">Thông tin địa chỉ</h2>
            </div>

            {createAddress ? (
                <>
                    <FormProvider {...addressForm}>
                        <form onSubmit={addressForm.handleSubmit(onSubmit)}>
                            <Row gutter={[24, 24]} align="top">
                                <Col span={12}>
                                    <label className="block text-gray-700">Số nhà</label>
                                    <InputForm
                                        error={addressForm.formState.errors['houseNumber']}
                                        name="houseNumber"
                                        type="text"
                                        required={true}
                                    />
                                </Col>

                                <Col span={12}>
                                    <label className="block text-gray-700">Quận / huyện</label>
                                    <InputForm
                                        error={addressForm.formState.errors['district']}
                                        name="district"
                                        type="text"
                                        required={true}
                                    />
                                </Col>

                                <Col xs={24} md={24}>
                                    <label className="block text-gray-700">Thành phố</label>
                                    <InputForm
                                        error={addressForm.formState.errors['city']}
                                        name="city"
                                        type="text"
                                        required={true}
                                    />
                                </Col>

                                <Col xs={24} md={8}>
                                    <Col xs={24} md={24}>
                                        <div className="flex items-center gap-3">
                                            <label className="block text-gray-700">Địa chỉ mặc định</label>
                                            <input
                                                {...addressForm.register('defaultAddress')}
                                                type="checkbox"
                                                className="p-2 border rounded-lg"
                                            />
                                        </div>
                                    </Col>
                                </Col>
                            </Row>

                            <div className="flex items-center justify-center mt-6" disabled={loading}>
                                <button className="w-1/2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                    Lưu thay đổi
                                </button>
                            </div>
                        </form>
                    </FormProvider>
                </>
            ) : (
                <AddressItem />
            )}

            {!createAddress && (
                <div className="flex item-center justify-center">
                    <Button
                        onClick={hanldeCreate}
                        className="w-[30%]  bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-5"
                    >
                        Tạo mới
                    </Button>
                </div>
            )}
        </div>
    );
};

export default Address;

import { Avatar, Button, Col, message, Row, Upload } from 'antd';
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { EyeInvisibleOutlined, EyeOutlined, UploadOutlined, UserOutlined } from '@ant-design/icons';
import { userService } from '~/services/user.service';
import { FormProvider, useForm } from 'react-hook-form';
import { path } from '~/config/path';
import useGetUserDetail from '~/hooks/useGetUserDetail';
import HelmetComponent from '~/components/Helmet';
import InputForm from '~/components/InputForm';
import { PHONE_RULE, PHONE_RULE_MESSAGE } from '~/utils/validator';
import { getUser, setUser } from '~/config/token';
import _ from 'lodash';

const Profile = () => {
    const user = getUser();
    const [imageUrl, setImageUrl] = useState();
    const [showPass, setShowPass] = useState(false);

    const updateForm = useForm({ mode: 'onChange' });
    const { data, refetch } = useGetUserDetail();

    // set form mặc định là giá trị detail từ get
    useEffect(() => {
        updateForm.reset(data);
    }, [data]);

    const onSubmitUpdate = async (form) => {
        const isChanged = JSON.stringify(updateForm.formState.defaultValues) === JSON.stringify(form);
        if (isChanged) {
            return message.error('Không có gì thay đổi');
        }
        try {
            const data = await userService?.update(form);
            if (data?.success) {
                const { password, ...user } = data?.user;
                setUser(user);
                message.success(data.message);
                refetch();
            }
        } catch (error) {
            message.error(error.response.data?.message);
        }
    };

    const handleUpload = (info) => {
        const file = info.file;
        if (file) {
            const reader = new FileReader();

            reader.onload = (e) => {
                setImageUrl(e.target?.result); // Lưu đường dẫn ảnh
                updateForm.setValue('avatar', e.target?.result);
            };

            reader.readAsDataURL(file); // Đọc file dưới dạng URL base64
        }
    };
    useEffect(() => {
        if (!user) {
            message.warning('Yêu cầu đăng nhập');
        } else if (user?.isAdmin) {
            message.warning('Không thể thay đổi thông tin Admin');
        }
    }, [user]);

    if (!user || user?.isAdmin) {
        return <Navigate to={path.Home} />;
    }
    return (
        <div className="w-full mx-auto bg-white p-6 rounded-lg shadow-md">
            <HelmetComponent title="Thông tin tài khoản" />
            <h2 className="text-2xl font-semibold mb-4">Thông tin tài khoản</h2>
            <FormProvider {...updateForm}>
                <form onSubmit={updateForm.handleSubmit(onSubmitUpdate)}>
                    <Row gutter={[24, 24]} align="top">
                        <Col xs={24} md={8}>
                            <div className="flex flex-col items-center gap-4 p-4 border rounded-lg shadow-md w-full">
                                {/* Hiển thị avatar */}
                                <Avatar
                                    size={180}
                                    icon={!imageUrl ? <UserOutlined /> : undefined}
                                    src={imageUrl || data?.avatar || user?.avatar}
                                />
                                {/* Nút tải ảnh lên */}
                                <Upload showUploadList={false} beforeUpload={() => false} onChange={handleUpload}>
                                    <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                                </Upload>
                            </div>
                        </Col>

                        <Col xs={24} md={16}>
                            <Row gutter={[24, 24]}>
                                <Col span={12}>
                                    <label className="block text-gray-700">Họ & Tên</label>
                                    <InputForm
                                        error={updateForm?.formState.errors['name']}
                                        name="name"
                                        type="text"
                                        required={true}
                                        placeholder="Nhập họ & tên"
                                    />
                                </Col>

                                <Col span={12}>
                                    <label className="block text-gray-700">Email</label>
                                    <InputForm
                                        error={updateForm?.formState.errors['email']}
                                        name="email"
                                        type="text"
                                        disabled
                                        required={true}
                                        placeholder="abc@example.com"
                                    />
                                </Col>

                                <Col xs={24} md={24}>
                                    <label className="block text-gray-700">Số điện thoại</label>
                                    <InputForm
                                        error={updateForm?.formState.errors['phone']}
                                        name="phone"
                                        type="text"
                                        required={true}
                                        placeholder="Nhập số điện thoại"
                                        pattern={{
                                            value: PHONE_RULE,
                                            message: PHONE_RULE_MESSAGE,
                                        }}
                                    />
                                </Col>

                                <Col xs={24} md={12}>
                                    <label className="block text-gray-700">Mật khẩu cũ</label>
                                    <div className="relative">
                                        <InputForm
                                            error={updateForm?.formState.errors['password']}
                                            name="password"
                                            type={showPass ? 'text' : 'password'}
                                            placeholder="Nhập mật khẩu"
                                        />
                                        <div
                                            className="absolute top-[50%] right-2 transform -translate-y-1/2 cursor-pointer w-[20px] h-[20px]"
                                            onClick={() => setShowPass(!showPass)}
                                        >
                                            {showPass ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                                        </div>
                                    </div>
                                </Col>

                                <Col xs={24} md={12}>
                                    <label className="block text-gray-700">Mật khẩu mới</label>
                                    <div className="relative">
                                        <InputForm
                                            error={updateForm?.formState.errors['newPassword']}
                                            name="newPassword"
                                            placeholder="Nhập mật khẩu mới"
                                            type={showPass ? 'text' : 'password'}
                                        />
                                        <div
                                            className="absolute top-[50%] right-2 transform -translate-y-1/2 cursor-pointer w-[20px] h-[20px]"
                                            onClick={() => setShowPass(!showPass)}
                                        >
                                            {showPass ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                                        </div>
                                    </div>
                                </Col>

                                <Col xs={24} md={12}>
                                    <button className="w-1/2 bg-blue-500 hover:bg-blue-700 text-white  mt-5 font-bold py-2 px-4 rounded">
                                        Lưu thay đổi
                                    </button>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </form>
            </FormProvider>
        </div>
    );
};

export default Profile;

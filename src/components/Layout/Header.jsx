import React, { useState, useEffect, forwardRef } from 'react';
import { Badge, Col, List, Row } from 'antd';
import { generatePath, Link, useNavigate } from 'react-router-dom';
import { ShoppingCartOutlined, UserOutlined, MenuOutlined, CaretDownOutlined, HeartOutlined } from '@ant-design/icons';
import { Dropdown, Space } from 'antd';
import SearchBar from '../SearchBar';
import Sidebar from '../Sidebar';
import { path } from '~/config/path';
import AuthModal from '~/pages/AuthModal';
import { useAppStore } from '~/store/useAppStore';
import { getUser, removeUser, removeToken } from '~/config/token';
import useGetCart from '~/hooks/useGetCart';
import { useLocalStore } from '~/store/useLocalStore';
import { formatNumber } from '~/utils/formatNumber';
import { useQuery } from '@tanstack/react-query';
import { wishlistService } from '~/services/wishlist.service';

const Header = forwardRef((props, ref) => {
    const user = getUser();

    const navigate = useNavigate();
    const { data: dataCart } = useGetCart();
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const { cartLocal } = useLocalStore();

    
    const { data: dataWishlist, refetch} = useQuery({
        queryKey: ['wishlist'],
        queryFn: async () => await wishlistService.getWishlist(),
        enabled: !!user, 
    });

    const { toggleSidebar, toggleModal, searchResults, setOverlayVisible, setSearchResults, isOverlayVisible } =
        useAppStore();

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = () => {
        removeUser();
        removeToken();
        navigate('/', { replace: true }); // Điều hướng mà không tạo history mới
        toggleSidebar(false);
        window.location.replace('/'); // Chỉ dùng nếu cần reset toàn bộ app state
    };

    const hanldeShowSearch = () => {
        setOverlayVisible(false);
        setSearchResults([]);
    };

    const items = [
        {
            key: '1',
            label: `${user?.isAdmin ? 'Quản lý hệ thống' : 'Thông tin tài khoản'}`,
            onClick: () => navigate(`${user?.isAdmin ? path.Admin : path.Account.Profile}`),
        },
        !user?.isAdmin && {
            key: '2',
            label: 'Đơn hàng',
            onClick: () => navigate(path.Account.MyOrder),
        },
        {
            key: '3',
            label: 'Đăng xuất',
            onClick: handleLogout,
        },
    ].filter(Boolean);

    return (
        <>
            <div className="bg-[#15395b] h-[70px]  flex items-center z-30 w-full ">
                <Row className="w-full container justify-between" style={{ alignItems: 'center' }}>
                    <Col span={windowWidth >= 1000 ? 4 : 8}>
                        <Link to={path.Home} style={{ color: '#fff', fontSize: '20px', fontFamily: 'sans-serif' }}>
                            SHOP
                        </Link>
                    </Col>
                    <Col span={windowWidth >= 1000 ? 12 : 0}>
                        <SearchBar ref={ref} placeholder="Tìm kiếm..." size="large" text="Tìm kiếm" />
                        {isOverlayVisible && searchResults && searchResults?.length > 0 && (
                            <List
                                bordered
                                dataSource={searchResults || []}
                                renderItem={(item) => (
                                    <Link
                                        to={generatePath(path.ProductDetail, {
                                            slug: item?.categories,
                                            id: item?._id,
                                        })}
                                        onClick={hanldeShowSearch}
                                    >
                                        <List.Item
                                            style={{
                                                margin: '10px',
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}
                                        >
                                            {/* Ảnh sản phẩm */}
                                            <img
                                                src={item.image[0]}
                                                alt={item.name}
                                                width={50}
                                                height={50}
                                                style={{
                                                    width: 50,
                                                    height: 50,
                                                    objectFit: 'cover',
                                                    borderRadius: 8,
                                                    marginRight: 15,
                                                }}
                                            />

                                            {/* Thông tin sản phẩm */}
                                            <div style={{ flex: 1, cursor: 'pointer' }}>
                                                <h4
                                                    style={{ margin: 0, fontSize: '16px', color: '#333' }}
                                                    className="line-clamp-2 "
                                                >
                                                    {item.name}
                                                </h4>
                                            </div>

                                            {/* Giá sản phẩm */}
                                            <div>
                                                <p
                                                    style={{
                                                        margin: 0,
                                                        fontSize: '16px',
                                                        fontWeight: 'bold',
                                                        color: '#ff4d4f',
                                                        paddingLeft: '20px',
                                                    }}
                                                >
                                                    {formatNumber(item.price || 0)}₫
                                                </p>
                                            </div>
                                        </List.Item>
                                    </Link>
                                )}
                                style={{
                                    position: 'absolute',
                                    width: '100%',
                                    background: 'white',
                                    zIndex: 1000,
                                    maxHeight: '300px',
                                    overflowY: 'auto',
                                    borderRadius: '5px',
                                }}
                            />
                        )}
                    </Col>
                    <Col span={windowWidth <= 1000 ? 4 : 8} className="flex justify-end items-center">
                        {windowWidth >= 1000 ? (
                            <>
                                <div className="relative">
                                    {' '}
                                    {/* wrapper này để làm gốc tọa độ cho absolute */}
                                    <div className="account flex pl-[20px] items-center relative">
                                        {user?.avatar ? (
                                            <>
                                                <img
                                                    width={50}
                                                    height={50}
                                                    src={user?.avatar}
                                                    alt=""
                                                    referrerPolicy="no-referrer"
                                                    className="w-[50px] h-[50px] rounded-full object-cover"
                                                />
                                            </>
                                        ) : (
                                            <UserOutlined style={{ fontSize: '30px', color: '#fff' }} />
                                        )}

                                        <div className="account__detail pl-[10px]">
                                            <Dropdown menu={{ items }} trigger={user ? ['hover'] : []}>
                                                <button
                                                    onClick={toggleModal}
                                                    disabled={user}
                                                    className="cursor-pointer"
                                                >
                                                    <Space className="text-[#fff] text-[17px]">
                                                        {user ? user?.name : 'Tài khoản'}
                                                    </Space>
                                                </button>
                                            </Dropdown>
                                        </div>
                                        <CaretDownOutlined
                                            style={{ color: '#fff', cursor: 'pointer', padding: '2px 0 0 5px' }}
                                        />

                                        {/* Line xám bên phải */}
                                        <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-[2px] h-[60%] bg-gray-400"></div>
                                    </div>
                                </div>

                                {!user?.isAdmin && (
                                    <>
                                        <Link
                                            className="cart pl-[20px] flex item-center cursor-pointer flex-col justify-center text-center"
                                            to={path.Cart}
                                        >
                                            <div className="icon relative">
                                                <Badge
                                                    count={
                                                        user
                                                            ? dataCart?.totalProduct > 0
                                                                ? dataCart?.totalProduct
                                                                : 0
                                                            : cartLocal?.totalProduct > 0
                                                            ? cartLocal?.totalProduct
                                                            : 0
                                                    }
                                                >
                                                    <ShoppingCartOutlined style={{ fontSize: '30px', color: '#fff' }} />
                                                </Badge>
                                            </div>
                                        </Link>

                                        {user && (
                                            <Link
                                                className="cart pl-[20px] flex item-center cursor-pointer flex-col justify-center text-center"
                                                to={path.Account.Wishlist}
                                            >
                                                <div className="icon relative">
                                                    <Badge
                                                        count={dataWishlist?.wishlist?.products.length || 0}
                                                    >
                                                        <HeartOutlined style={{ fontSize: '30px', color: '#fff' }} />
                                                    </Badge>
                                                </div>
                                            </Link>
                                        )}
                                    </>
                                )}
                            </>
                        ) : (
                            <button onClick={() => toggleSidebar(true)}>
                                <MenuOutlined style={{ fontSize: '30px', color: '#fff', cursor: 'pointer' }} />
                            </button>
                        )}
                    </Col>
                    <Sidebar />
                </Row>
                <AuthModal />
            </div>
        </>
    );
});

export default Header;

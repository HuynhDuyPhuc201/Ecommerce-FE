import { Button, message } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { generatePath, Link, useNavigate } from 'react-router-dom';
import { path } from '~/config/path';
import { formatNumber } from '~/utils/formatNumber';
import { Eye, ShoppingCart } from 'lucide-react';
import { getUser, removeAddress } from '~/config/token';
import useGetUserDetail from '~/hooks/useGetUserDetail';
import ProductDetailModal from './ProductDetailModal';
import { useScrollTop } from '~/hooks/useScrollTop';
import { CloseOutlined, CloseSquareOutlined, HeartFilled, HeartOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { wishlistService } from '~/services/wishlist.service';

const ProductCard = ({ item, heartIcon = false, closeIcon = false }) => {
    const navigate = useNavigate();
    const [liked, setLiked] = useState(false);
    const { data: dataUser } = useGetUserDetail();
    const user = getUser();
    const [isModalVisible, setIsModalVisible] = useState(false);

    const { data: dataWishlist, refetch } = useQuery({
        queryKey: ['wishlist'],
        queryFn: async () => await wishlistService.getWishlist(),
        enabled: !!user, 
    });

    useEffect(() => {
        const check = dataWishlist?.wishlist?.products.some((p) => p._id === item._id);
        setLiked(check ? true : false);
    }, [dataWishlist?.wishlist?.products]);

    const discount = useMemo(
        () => (item?.price_old ? ((item?.price_old - item?.price) / item?.price_old) * 100 : 0),
        [item?.price, item?.price_old],
    );

    const handleClickItem = () => useScrollTop();

    const handleViewClick = (e) => {
        e.preventDefault();
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
    };

    const pathURL = useMemo(
        () => generatePath(path.ProductDetail, { slug: item?.categories || '', id: item?._id }),
        [item.categories, item._id],
    );
    let address = dataUser?.address?.find((item) => item?.defaultAddress) || dataUser?.address[0] || {};
    const handleBuyNow = useCallback(async () => {
        handleClickItem();
        if (!user) removeAddress();
        const form = {
            orderItems: [
                {
                    productId: item._id,
                    name: item.name,
                    price: item.price,
                    image: item.image?.[0],
                    quantity: 1,
                },
            ],
            shippingAddress: address,
            subTotal: item.price * 1,
            totalProduct: 1,
            userId: user ? user?._id : null,
            slug: item.categories || '',
        };
        navigate(path.Payment, { state: form });
    }, []);

    const handleWishlist = async (type) => {
        try {
            const service =
                type === 'add'
                    ? wishlistService.addWishlist({ productId: item._id })
                    : wishlistService.deleteWishlist(item._id);
            const result = await service;
            if (result.success) {
                message.success(result.message);
                refetch();
            }
        } catch (error) {
            message.error(error?.response.data.message || 'Lỗi');
        }
    };

    return (
        <div className="group relative rounded-lg shadow-md cursor-pointer">
            <div className="border  overflow-hidden transition-all duration-300 hover:shadow-lg">
                <div className="group relative h-[200px] overflow-hidden">
                    <img
                        width={200} // hoặc bất kỳ số nào gần đúng
                        height={200}
                        src={item.image[0]}
                        loading="lazy"
                        alt={item?.name || ''}
                        className={`h-full w-full object-cover transition-all duration-500 group-hover:opacity-0
                            ${!item.countInstock ? 'opacity-50' : 'opacity-100'}
                        `}
                    />

                    {/* Second image on hover effect */}
                    {item.image?.length > 1 && (
                        <img
                            width={200} // hoặc bất kỳ số nào gần đúng
                            height={200}
                            src={item.image[1]}
                            loading="lazy"
                            className="absolute inset-0 h-full w-full object-cover opacity-0 group-hover:opacity-100 transition-all duration-500"
                        />
                    )}

                    {/* Out of stock overlay */}
                    {!item.countInstock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <div className="flex items-center justify-center w-[70px] h-[70px] rounded-full bg-[#000]">
                                <span className=" text-[12px] text-white">Đã bán hết</span>
                            </div>
                        </div>
                    )}
                    {user && heartIcon && (
                        <div
                            onClick={() => handleWishlist('add')}
                            className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-lg text-black/80 rounded-full bg-white hover:text-red-500 hover:shadow transition-colors duration-200 cursor-pointer"
                        >
                            {liked ? (
                                <HeartFilled style={{ color: 'red' }} />
                            ) : (
                                <HeartOutlined style={{ color: 'red' }} />
                            )}
                        </div>
                    )}
                    {closeIcon && (
                        <div
                            onClick={() => handleWishlist('delete')}
                            className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-xl rounded-full bg-white transition-colors duration-200 cursor-pointer"
                        >
                           <CloseOutlined />
                        </div>
                    )}
                    {/* Hover action buttons */}
                    <div className="absolute bottom-2 left-0 right-0 mx-2 flex items-center justify-center gap-2 transition-all duration-300 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                        <Button
                            size="lg"
                            variant="secondary"
                            className="rounded-full px-3 text-[#000] bg-[#fff] shadow-lg text-[12px] mdtext-[13px]"
                            onClick={handleViewClick}
                        >
                            <Eye className="md:h-6 h-5 md:w-6 w-5" />
                            <p>Xem</p>
                        </Button>

                        <Button
                            size="sm"
                            variant="default"
                            className={`rounded-full px-3 !bg-[#fff] !text-[#000] shadow-lg text-[12px] mdtext-[13px] ${
                                !item.countInstock ? 'opacity-50' : 'opacity-100'
                            }`}
                            disabled={user?.isAdmin || !item.countInstock}
                            onClick={handleBuyNow}
                        >
                            <ShoppingCart className="md:h-6 h-5 md:w-6 w-5" />
                            Mua ngay
                        </Button>
                    </div>

                    {/* Discount tag */}
                    {discount > 0 && (
                        <div className="absolute left-2 top-2 rounded-md bg-red-700 px-2 py-1 text-lg font-bold text-white">
                            -{discount.toFixed(0)}%
                        </div>
                    )}
                </div>

                <div className="p-4">
                    {/* Product name */}
                    <Link to={pathURL} onClick={handleClickItem}>
                        <h3 className="mb-1 line-clamp-2 text-[14px] h-[40px] font-medium" title={item.name}>
                            {item.name}
                        </h3>

                        {/* Rating */}
                        <div className="mb-2 flex items-center mt-5">
                            <span className="mr-1 text-[15px]">{item.rating.toFixed(1)}</span>
                            <div className="flex text-yellow-400 items-center">
                                {[...Array(5)].map((_, i) => (
                                    <svg
                                        key={i}
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className={`h-6 w-6 ${
                                            i < Math.floor(item.rating) ? 'opacity-100' : 'opacity-30'
                                        }`}
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                ))}
                            </div>
                        </div>

                        {/* Price info */}
                        <div className="flex flex-col">
                            <p className="text-[16px] font-bold text-red-800">{formatNumber(item?.price) || 0}₫</p>
                            {item.price_old && (
                                <div className="flex items-center gap-2">
                                    <span className="text-[13px] text-gray-700 line-through">
                                        {formatNumber(item.price_old)}₫
                                    </span>
                                </div>
                            )}
                        </div>
                    </Link>
                </div>
            </div>
            <ProductDetailModal open={isModalVisible} product={item} onClose={handleCloseModal} />
        </div>
    );
};

export default ProductCard;

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { generatePath, Link, NavLink, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { path } from '~/config/path';
import { productService } from '~/services/product.service';

const TextCategory = () => {
    const { id } = useParams();
    const { pathname } = useLocation();

    const fetchData = async (req, res) => {
        return await productService.getCategory();
    };

    const { data } = useQuery({
        queryKey: ['category'],
        queryFn: fetchData,
    });
    console.log(data, 'data');

    return (
        <div className="category bg-[#fff] rounded-[8px] p-10 w-full my-2">
            <p className="text-[20px] text-[#333] font-bold mb-5">Danh mục</p>
            <Link
                className={`text-[16px]  cursor-pointer ${pathname === '/' ? 'text-[#69b1ff]' : 'text-[#333]'}`}
                to={path.Home}
            >
                <li>Tất cả</li>
            </Link>
            {data?.map((item, index) => (
                <NavLink
                    to={{ pathname: `/${item.id}` }}
                    key={index}
                    className={`text-[16px] text-[#333] cursor-pointer ${
                        item.id == id ? 'text-[#69b1ff]' : 'text-[#333]'
                    }`}
                >
                    <li> {item?.title}</li>
                </NavLink>
            ))}
        </div>
    );
};

export default TextCategory;

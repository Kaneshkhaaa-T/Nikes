import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { fetchProductDetails, updateProduct } from '../../Redux/Slices/productsSlice';

const EditProductPage = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const { selectedProduct, loading, error } = useSelector((state) => state.products);

    const [productData, setProductData] = useState({
        name: "",
        description: "",
        price: "",
        countInStock: 0,
        sku: "",
        category: "",
        brand: "",
        sizes: [],
        colors: [],
        collections: "",
        material: "",
        gender: "",
        images: [],
    });

    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (id) {
            dispatch(fetchProductDetails(id));
        }
    }, [dispatch, id]);

    useEffect(() => {
        if (selectedProduct) {
            setProductData(selectedProduct);
        }
    }, [selectedProduct]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        const imageFormData = new FormData(); // ✅ Bug 3 fixed: renamed from 'formData'
        imageFormData.append("image", file);
        try {
            setUploading(true);
            const { data } = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/upload`,
                imageFormData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            setProductData((prevData) => ({
                ...prevData,
                images: [...prevData.images, { url: data.imageUrl, altText: "" }],
            }));
        } catch (error) {
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    // ✅ Bug 4 fixed: Added image delete handler
    const handleImageDelete = (indexToDelete) => {
        setProductData((prevData) => ({
            ...prevData,
            images: prevData.images.filter((_, index) => index !== indexToDelete),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await dispatch(updateProduct({ id, productData }));
        navigate("/admin/products");
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="max-w-5xl mx-auto p-6 shadow-md rounded-md">
            <h2 className="text-3xl font-bold mb-6">Edit Product</h2>
            <form onSubmit={handleSubmit}>
                {/* Name */}
                <div className="mb-6">
                    <label className="block font-semibold mb-2">Product Name</label>
                    <input type="text" name="name" value={productData.name}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md p-2"
                        required
                    />
                </div>
                {/* Description */}
                <div className="mb-6">
                    <label className="block font-semibold mb-2">Description</label>
                    <textarea name="description" value={productData.description}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md p-2"
                        rows={4} required>
                    </textarea>
                </div>
                {/* Price */}
                <div className="mb-6">
                    <label className="block font-semibold mb-2">Price</label>
                    <input type="text" name="price" value={productData.price}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md p-2"
                    />
                </div>
                {/* Count in Stock */}
                <div className="mb-6">
                    <label className="block font-semibold mb-2">Count in Stock</label>
                    <input type="number" name="countInStock" value={productData.countInStock}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md p-2"
                    />
                </div>
                {/* SKU */}
                <div className="mb-6">
                    <label className="block font-semibold mb-2">SKU</label>
                    <input type="text" name="sku" value={productData.sku}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md p-2"
                    />
                </div>
                {/* Sizes */}
                <div className="mb-6">
                    <label className="block font-semibold mb-2">Sizes (comma-separated)</label>
                    <input type="text" name="sizes"
                        value={productData.sizes.join(", ")}
                        onChange={(e) => setProductData({
                            ...productData,
                            sizes: e.target.value.split(",").map((size) => size.trim()),
                        })}
                        className="w-full border border-gray-300 rounded-md p-2"
                    />
                </div>
                {/* Colors */}
                <div className="mb-6">
                    <label className="block font-semibold mb-2">Colors (comma-separated)</label>
                    <input type="text" name="colors"
                        value={productData.colors.join(", ")}
                        onChange={(e) => setProductData({
                            ...productData,
                            colors: e.target.value.split(",").map((color) => color.trim()),
                        })}
                        className="w-full border border-gray-300 rounded-md p-2"
                    />
                </div>
                {/* Image Upload */}
                <div className="mb-6">
                    <label className="block font-semibold mb-2">Upload Image</label>
                    <input type="file" onChange={handleImageUpload} />
                    {uploading && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}
                    <div className="flex gap-4 mt-4 flex-wrap">
                        {productData.images.map((image, index) => (
                            <div key={index} className="relative"> {/* ✅ relative for delete button positioning */}
                                <img
                                    src={image.url}
                                    alt={image.altText || "Product Image"}
                                    className="w-20 h-20 object-cover rounded-md shadow-md"
                                />
                                {/* ✅ Delete button on each image */}
                                <button
                                    type="button"
                                    onClick={() => handleImageDelete(index)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Submit */}
                <button type="submit"
                    className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors">
                    Update Product
                </button>
            </form>
        </div>
    );
};

export default EditProductPage;
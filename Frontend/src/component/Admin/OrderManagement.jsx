import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchAllOrders, updateOrderStatus } from "../../Redux/Slices/adminOrderSlice";

const OrderManagement = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user } = useSelector((state) => state.auth);
    const { orders, loading, error } = useSelector((state) => state.adminOrders);

    // Track which order's QR is expanded
    const [expandedQR, setExpandedQR] = useState(null);

    useEffect(() => {
        if (!user || user.role !== "admin") {
            navigate("/");
        } else {
            dispatch(fetchAllOrders());
        }
    }, [dispatch, user, navigate]);

    const handleStatusChange = (orderId, status) => {
        dispatch(updateOrderStatus({ id: orderId, status }));
    };

    const handlePrintQR = (order) => {
        const win = window.open("", "_blank");
        win.document.write(`
            <html>
              <body style="text-align:center; padding:40px; font-family:sans-serif;">
                <h2>Order #${order._id.slice(-8).toUpperCase()}</h2>
                <p style="color:#555;">Customer: ${order.user?.name || "Guest"}</p>
                <p style="color:#555;">Total: $${order.totalPrice.toFixed(2)}</p>
                <img src="${order.qrCodeImage}" style="width:200px; height:200px; margin:20px auto; display:block;" />
                <p style="font-size:12px; color:#999; margin-top:10px;">
                  Attach this tag to the product. Do not share.
                </p>
              </body>
            </html>
        `);
        win.print();
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="max-w-7xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6">Order Management</h2>
            <div className="overflow-x-auto shadow-md sm:rounded-lg">
                <table className="min-w-full text-left text-gray-500">
                    <thead className="bg-gray-100 text-xs uppercase text-gray-700">
                        <tr>
                            <th className="py-3 px-4">Order Id</th>
                            <th className="py-3 px-4">Customer</th>
                            <th className="py-3 px-4">Total Price</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">QR Tag</th>
                            <th className="py-3 px-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length > 0 ? (
                            orders.map((order) => (
                                <>
                                    {/* ── Main Row ── */}
                                    <tr
                                        key={order._id}
                                        className="border-b hover:bg-gray-50 cursor-pointer"
                                    >
                                        <td className="py-4 px-4 font-medium text-gray-900 whitespace-nowrap">
                                            #{order._id}
                                        </td>

                                        <td className="p-4">{order.user?.name || "Guest"}</td>

                                        <td className="p-4">${order.totalPrice.toFixed(2)}</td>

                                        <td className="p-4">
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                className="bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                                            >
                                                <option value="Processing">Processing</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </td>

                                        {/* ── QR Tag Column ── */}
                                        <td className="p-4">
                                            {order.qrCodeImage ? (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() =>
                                                            setExpandedQR(
                                                                expandedQR === order._id ? null : order._id
                                                            )
                                                        }
                                                        className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded text-sm hover:bg-blue-200"
                                                    >
                                                        {expandedQR === order._id ? "Hide QR" : "View QR"}
                                                    </button>
                                                    <button
                                                        onClick={() => handlePrintQR(order)}
                                                        className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-200"
                                                    >
                                                        Print
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">Not generated</span>
                                            )}

                                            {/* Return status badge */}
                                            {order.returnStatus && order.returnStatus !== "none" && (
                                                <span
                                                    className={`mt-2 inline-block px-2 py-0.5 rounded text-xs font-medium ${
                                                        order.returnStatus === "approved"
                                                            ? "bg-green-100 text-green-700"
                                                            : order.returnStatus === "rejected"
                                                            ? "bg-red-100 text-red-700"
                                                            : "bg-yellow-100 text-yellow-700"
                                                    }`}
                                                >
                                                    Return: {order.returnStatus}
                                                </span>
                                            )}
                                        </td>

                                        <td className="p-4">
                                            <button
                                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                                onClick={() => handleStatusChange(order._id, "Delivered")}
                                            >
                                                Mark as Delivered
                                            </button>
                                        </td>
                                    </tr>

                                    {/* ── QR Expanded Row (appears below the order row) ── */}
                                    {expandedQR === order._id && (
                                        <tr key={`qr-${order._id}`} className="bg-blue-50 border-b">
                                            <td colSpan={6} className="px-8 py-4">
                                                <div className="flex items-start gap-6">
                                                    <img
                                                        src={order.qrCodeImage}
                                                        alt="QR Code"
                                                        className="w-36 h-36 border-2 border-blue-200 rounded-lg"
                                                    />
                                                    <div>
                                                        <p className="font-semibold text-gray-700 mb-1">
                                                            Product Security QR Code
                                                        </p>
                                                        <p className="text-sm text-gray-500 mb-3">
                                                            Print and attach this to the physical product tag before shipping.
                                                            The delivery person will scan this during return pickup to verify authenticity.
                                                        </p>
                                                        <div className="flex gap-2 flex-wrap">
                                                            <span className="text-xs bg-white border border-blue-200 text-blue-600 px-3 py-1 rounded-full">
                                                                Order: #{order._id.slice(-8).toUpperCase()}
                                                            </span>
                                                            <span className="text-xs bg-white border border-gray-200 text-gray-500 px-3 py-1 rounded-full">
                                                                Secret is hidden — stored securely in DB
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={() => handlePrintQR(order)}
                                                            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                                                        >
                                                            Print QR Tag
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="text-center p-4 text-gray-500">
                                    No Orders Available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrderManagement;
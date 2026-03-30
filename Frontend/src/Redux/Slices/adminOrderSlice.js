import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const getAuthHeader = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
    },
});

// Fetch all orders (admin only)
export const fetchAllOrders = createAsyncThunk(
    "adminOrders/fetchAllOrders",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/admin/orders`,
                getAuthHeader()
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Update order delivery status
export const updateOrderStatus = createAsyncThunk(
    "adminOrders/updateOrderStatus",
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const response = await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/api/admin/orders/${id}`,
                { status },
                getAuthHeader()
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Delete an order
export const deleteorder = createAsyncThunk(
    "adminOrders/deleteorder",
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(
                `${import.meta.env.VITE_BACKEND_URL}/api/admin/orders/${id}`,
                getAuthHeader()
            );
            return id;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const adminOrderSlice = createSlice({
    name: "adminOrders",
    initialState: {
        orders: [],
        totalOrders: 0,
        totalSales: 0,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch all orders
            .addCase(fetchAllOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload;
                state.totalOrders = action.payload.length;
                state.totalSales = action.payload.reduce(
                    (acc, order) => acc + order.totalPrice, 0
                );
            })
            .addCase(fetchAllOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Something went wrong"; // ✅ Bug 3 fixed
            })

            // Update order status
            .addCase(updateOrderStatus.fulfilled, (state, action) => { // ✅ Bug 1 fixed
                const updatedOrder = action.payload;
                const orderIndex = state.orders.findIndex(
                    (order) => order._id === updatedOrder._id // ✅ Bug 2 fixed
                );
                if (orderIndex !== -1) {
                    state.orders[orderIndex] = updatedOrder;
                }
            })

            // Delete order
            .addCase(deleteorder.fulfilled, (state, action) => {
                state.orders = state.orders.filter(
                    (order) => order._id !== action.payload
                );
            });
    },
});

export default adminOrderSlice.reducer;
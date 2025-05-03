/**
 * Samudra Paket ERP - Shipment Slice
 * Manages shipment state in Redux store
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = '/api/shipments';

// Async thunks
export const fetchShipments = createAsyncThunk(
  'shipment/fetchShipments',
  async ({ page = 1, limit = 10, filters = {} }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...filters
      }).toString();
      
      const response = await axios.get(`${API_URL}?${queryParams}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch shipments' });
    }
  }
);

export const fetchShipmentById = createAsyncThunk(
  'shipment/fetchShipmentById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch shipment' });
    }
  }
);

export const fetchShipmentByWaybill = createAsyncThunk(
  'shipment/fetchShipmentByWaybill',
  async (waybillNo, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/waybill/${waybillNo}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch shipment' });
    }
  }
);

export const createShipment = createAsyncThunk(
  'shipment/createShipment',
  async (shipmentData, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, shipmentData);
      toast.success('Shipment created successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to create shipment';
      toast.error(message);
      return rejectWithValue(error.response?.data || { message });
    }
  }
);

export const updateShipment = createAsyncThunk(
  'shipment/updateShipment',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, data);
      toast.success('Shipment updated successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to update shipment';
      toast.error(message);
      return rejectWithValue(error.response?.data || { message });
    }
  }
);

export const updateShipmentStatus = createAsyncThunk(
  'shipment/updateShipmentStatus',
  async ({ id, status, notes }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}/status`, { status, notes });
      toast.success('Shipment status updated successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to update shipment status';
      toast.error(message);
      return rejectWithValue(error.response?.data || { message });
    }
  }
);

export const calculateShippingPrice = createAsyncThunk(
  'shipment/calculateShippingPrice',
  async (priceData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/calculate-price`, priceData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to calculate price' });
    }
  }
);

export const validateDestination = createAsyncThunk(
  'shipment/validateDestination',
  async (destinationData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/validate-destination`, destinationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to validate destination' });
    }
  }
);

export const generateWaybillDocument = createAsyncThunk(
  'shipment/generateWaybillDocument',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${id}/waybill-document`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `waybill-${id}.pdf`);
      
      // Append to html link element page
      document.body.appendChild(link);
      
      // Start download
      link.click();
      
      // Clean up and remove the link
      link.parentNode.removeChild(link);
      
      return { success: true };
    } catch (error) {
      toast.error('Failed to generate waybill document');
      return rejectWithValue(error.response?.data || { message: 'Failed to generate waybill document' });
    }
  }
);

// Initial state
const initialState = {
  shipments: [],
  currentShipment: null,
  price: null,
  destinationValid: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  },
  loading: false,
  priceLoading: false,
  error: null,
  success: false
};

// Slice
const shipmentSlice = createSlice({
  name: 'shipment',
  initialState,
  reducers: {
    resetShipmentState: (state) => {
      return { 
        ...initialState,
        shipments: state.shipments,
        pagination: state.pagination
      };
    },
    resetCurrentShipment: (state) => {
      state.currentShipment = null;
    },
    clearShipmentError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch shipments
      .addCase(fetchShipments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShipments.fulfilled, (state, action) => {
        state.loading = false;
        state.shipments = action.payload.data;
        state.pagination = {
          total: action.payload.meta.total,
          page: action.payload.meta.page,
          limit: action.payload.meta.limit,
          totalPages: action.payload.meta.totalPages
        };
        state.success = true;
      })
      .addCase(fetchShipments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Fetch shipment by ID
      .addCase(fetchShipmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShipmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentShipment = action.payload.data;
        state.success = true;
      })
      .addCase(fetchShipmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Fetch shipment by waybill no
      .addCase(fetchShipmentByWaybill.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShipmentByWaybill.fulfilled, (state, action) => {
        state.loading = false;
        state.currentShipment = action.payload.data;
        state.success = true;
      })
      .addCase(fetchShipmentByWaybill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Create shipment
      .addCase(createShipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createShipment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentShipment = action.payload.data;
        state.success = true;
      })
      .addCase(createShipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Update shipment
      .addCase(updateShipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateShipment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentShipment = action.payload.data;
        state.success = true;
      })
      .addCase(updateShipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Update shipment status
      .addCase(updateShipmentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateShipmentStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.currentShipment = action.payload.data;
        state.success = true;
      })
      .addCase(updateShipmentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Calculate shipping price
      .addCase(calculateShippingPrice.pending, (state) => {
        state.priceLoading = true;
        state.error = null;
      })
      .addCase(calculateShippingPrice.fulfilled, (state, action) => {
        state.priceLoading = false;
        state.price = action.payload.data;
        state.success = true;
      })
      .addCase(calculateShippingPrice.rejected, (state, action) => {
        state.priceLoading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Validate destination
      .addCase(validateDestination.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateDestination.fulfilled, (state, action) => {
        state.loading = false;
        state.destinationValid = action.payload.data;
        state.success = true;
      })
      .addCase(validateDestination.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.destinationValid = false;
        state.success = false;
      });
  }
});

export const { resetShipmentState, resetCurrentShipment, clearShipmentError } = shipmentSlice.actions;
export default shipmentSlice.reducer;

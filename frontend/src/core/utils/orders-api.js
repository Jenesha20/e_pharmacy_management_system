// Orders API functions for backend integration

const API_BASE_URL = 'http://localhost:3000';

// Get all orders for a customer
export async function getCustomerOrders(customerId) {
  try {
    const response = await fetch(`${API_BASE_URL}/orders?customer_id=${customerId}`);
    if (!response.ok) throw new Error('Failed to fetch orders');
    return await response.json();
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

// Get a specific order by ID
export async function getOrderById(orderId) {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
    if (!response.ok) throw new Error('Failed to fetch order');
    return await response.json();
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
}

// Get order items for a specific order
export async function getOrderItems(orderId) {
  try {
    const response = await fetch(`${API_BASE_URL}/order_items?order_id=${orderId}`);
    if (!response.ok) throw new Error('Failed to fetch order items');
    return await response.json();
  } catch (error) {
    console.error('Error fetching order items:', error);
    throw error;
  }
}

// Get product details for order items
export async function getProductById(productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`);
    if (!response.ok) throw new Error('Failed to fetch product');
    return await response.json();
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}

// Get customer address by ID
export async function getAddressById(addressId) {
  try {
    const response = await fetch(`${API_BASE_URL}/customer_addresses/${addressId}`);
    if (!response.ok) throw new Error('Failed to fetch address');
    return await response.json();
  } catch (error) {
    console.error('Error fetching address:', error);
    throw error;
  }
}

// Create a new order
export async function createOrder(orderData) {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });
    
    if (!response.ok) throw new Error('Failed to create order');
    return await response.json();
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

// Create order items
export async function createOrderItems(orderItems) {
  try {
    const response = await fetch(`${API_BASE_URL}/order_items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderItems)
    });
    
    if (!response.ok) throw new Error('Failed to create order items');
    return await response.json();
  } catch (error) {
    console.error('Error creating order items:', error);
    throw error;
  }
}

// Update order status
export async function updateOrderStatus(orderId, status) {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status })
    });
    
    if (!response.ok) throw new Error('Failed to update order status');
    return await response.json();
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

// Get complete order details with items and address
export async function getCompleteOrderDetails(orderId) {
  try {
    // Get order details
    const order = await getOrderById(orderId);
    
    // Get order items
    const orderItems = await getOrderItems(orderId);
    
    // Get product details for each item
    const itemsWithProducts = await Promise.all(
      orderItems.map(async (item) => {
        try {
          const product = await getProductById(item.product_id);
          return {
            ...item,
            product: product
          };
        } catch (error) {
          console.error(`Error fetching product ${item.product_id}:`, error);
          return {
            ...item,
            product: {
              name: 'Unknown Product',
              image_url: null,
              composition: 'Unknown'
            }
          };
        }
      })
    );
    
    // Get shipping address
    let address = null;
    if (order.shipping_address_id) {
      try {
        address = await getAddressById(order.shipping_address_id);
      } catch (error) {
        console.error('Error fetching address:', error);
      }
    }
    
    return {
      ...order,
      items: itemsWithProducts,
      address: address
    };
  } catch (error) {
    console.error('Error fetching complete order details:', error);
    throw error;
  }
}

// Get all orders for a customer with complete details
export async function getCustomerOrdersWithDetails(customerId) {
  try {
    const orders = await getCustomerOrders(customerId);
    
    // Get complete details for each order
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        try {
          return await getCompleteOrderDetails(order.id);
        } catch (error) {
          console.error(`Error fetching details for order ${order.id}:`, error);
          return order; // Return basic order if details fail
        }
      })
    );
    
    return ordersWithDetails;
  } catch (error) {
    console.error('Error fetching customer orders with details:', error);
    throw error;
  }
}

// Helper function to generate order number
export function generateOrderNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `ORD-${year}${month}${day}-${random}`;
}

// Helper function to calculate order totals
export function calculateOrderTotals(items) {
  const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  const shipping = subtotal > 30 ? 0 : 5; // Free shipping over $30
  const total = subtotal + shipping;
  
  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    shipping: parseFloat(shipping.toFixed(2)),
    total: parseFloat(total.toFixed(2))
  };
}

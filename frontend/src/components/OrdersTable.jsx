import React from 'react';

function OrdersTable({ orders, onOrderClick, limit = null, showActions = false, onCancelOrder = null }) {
    // Apply limit if provided
    const displayOrders = limit ? orders.slice(0, limit) : orders;

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Order ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Services
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            {showActions && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {displayOrders.map((order) => (
                            <tr 
                                key={order.payment_id} 
                                className="hover:bg-gray-50"
                            >
                                <td 
                                    className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 cursor-pointer" 
                                    onClick={() => onOrderClick(order)}
                                >
                                    {order.payment_id.substring(0, 8)}...
                                </td>
                                <td 
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 cursor-pointer"
                                    onClick={() => onOrderClick(order)}
                                >
                                    {order.services.map(s => s.service_type).join(', ')}
                                </td>
                                <td 
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 cursor-pointer"
                                    onClick={() => onOrderClick(order)}
                                >
                                    {new Date(order.created_at).toLocaleDateString()}
                                </td>
                                <td 
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer"
                                    onClick={() => onOrderClick(order)}
                                >
                                    ₹{parseFloat(order.total_amount).toFixed(2)}
                                </td>
                                <td 
                                    className="px-6 py-4 whitespace-nowrap cursor-pointer"
                                    onClick={() => onOrderClick(order)}
                                >
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${(order.services[0].job_status === 'completed' || order.services[0].status === 'completed') ? 'bg-green-100 text-green-800' : 
                                        (order.services[0].job_status === 'cancelled' || order.services[0].status === 'cancelled') ? 'bg-red-100 text-red-800' : 
                                        'bg-yellow-100 text-yellow-800'}`}>
                                        {order.services[0].job_status || order.services[0].status}
                                    </span>
                                </td>
                                {showActions && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {(order.services[0].job_status === 'pending' || order.services[0].status === 'pending') && onCancelOrder && (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onCancelOrder(order.services[0].request_id);
                                                }}
                                                className="text-red-600 hover:text-red-900 font-medium"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                        
                        {displayOrders.length === 0 && (
                            <tr>
                                <td colSpan={showActions ? "6" : "5"} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No orders found. Book a service to get started!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default OrdersTable;

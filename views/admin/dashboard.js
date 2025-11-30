<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><%= title %></title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body class="bg-gray-100">
    <!-- Admin Header -->
    <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center py-4">
                <div class="flex items-center">
                    <h1 class="text-2xl font-bold text-gray-900">🛒 WooCommerce Clone</h1>
                    <nav class="ml-8 flex space-x-4">
                        <a href="/admin" class="text-gray-900 font-medium">Dashboard</a>
                        <a href="/admin/orders" class="text-gray-500 hover:text-gray-900">Orders</a>
                        <a href="/admin/products" class="text-gray-500 hover:text-gray-900">Products</a>
                        <a href="/admin/customers" class="text-gray-500 hover:text-gray-900">Customers</a>
                    </nav>
                </div>
                <div class="flex items-center space-x-4">
                    <span class="text-gray-700">Welcome, <%= user.firstName %></span>
                    <a href="/logout" class="text-gray-500 hover:text-gray-900">Logout</a>
                </div>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span class="text-white text-sm font-bold" id="totalOrders">0</span>
                        </div>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm font-medium text-gray-500">Total Orders</p>
                        <p class="text-2xl font-semibold text-gray-900" id="totalOrdersCount">0</p>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <span class="text-white text-sm font-bold">$</span>
                        </div>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm font-medium text-gray-500">Total Revenue</p>
                        <p class="text-2xl font-semibold text-gray-900" id="totalRevenue">$0</p>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                            <span class="text-white text-sm font-bold">M</span>
                        </div>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm font-medium text-gray-500">Monthly Revenue</p>
                        <p class="text-2xl font-semibold text-gray-900" id="monthlyRevenue">$0</p>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                            <span class="text-white text-sm font-bold">T</span>
                        </div>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm font-medium text-gray-500">Today's Orders</p>
                        <p class="text-2xl font-semibold text-gray-900" id="todayOrders">0</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Charts and Recent Orders -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Revenue Chart -->
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Revenue Overview</h3>
                <canvas id="revenueChart" width="400" height="200"></canvas>
            </div>

            <!-- Order Status -->
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Order Status</h3>
                <canvas id="orderStatusChart" width="400" height="200"></canvas>
            </div>
        </div>

        <!-- Recent Orders -->
        <div class="mt-8 bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">Recent Orders</h3>
            </div>
            <div class="p-6">
                <div id="recentOrders" class="space-y-4">
                    <!-- Orders will be loaded here -->
                </div>
            </div>
        </div>
    </main>

    <script>
        // Load dashboard data
        async function loadDashboardData() {
            try {
                // Load stats
                const statsResponse = await fetch('/api/orders/stats/overview');
                const stats = await statsResponse.json();
                
                document.getElementById('totalOrdersCount').textContent = stats.totalOrders;
                document.getElementById('totalRevenue').textContent = '$' + stats.totalRevenue.toLocaleString();
                document.getElementById('monthlyRevenue').textContent = '$' + stats.monthlyRevenue.toLocaleString();
                document.getElementById('todayOrders').textContent = stats.todayOrders;

                // Load recent orders
                const ordersResponse = await fetch('/api/orders?limit=5');
                const ordersData = await ordersResponse.json();
                
                const ordersContainer = document.getElementById('recentOrders');
                ordersContainer.innerHTML = ordersData.orders.map(order => `
                    <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                            <p class="font-medium text-gray-900">#${order.orderNumber}</p>
                            <p class="text-sm text-gray-500">${order.email}</p>
                        </div>
                        <div>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                                ${order.status === 'processing' ? 'bg-blue-100 text-blue-800' : ''}
                                ${order.status === 'shipped' ? 'bg-green-100 text-green-800' : ''}
                                ${order.status === 'delivered' ? 'bg-gray-100 text-gray-800' : ''}">
                                ${order.status}
                            </span>
                            <p class="text-sm font-medium text-gray-900 mt-1">$${order.total}</p>
                        </div>
                    </div>
                `).join('');

            } catch (error) {
                console.error('Error loading dashboard data:', error);
            }
        }

        // Initialize charts
        function initializeCharts() {
            // Revenue Chart
            const revenueCtx = document.getElementById('revenueChart').getContext('2d');
            new Chart(revenueCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Revenue',
                        data: [12000, 19000, 15000, 25000, 22000, 30000],
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });

            // Order Status Chart
            const statusCtx = document.getElementById('orderStatusChart').getContext('2d');
            new Chart(statusCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Pending', 'Processing', 'Shipped', 'Delivered'],
                    datasets: [{
                        data: [12, 19, 8, 15],
                        backgroundColor: [
                            'rgb(255, 205, 86)',
                            'rgb(54, 162, 235)',
                            'rgb(75, 192, 192)',
                            'rgb(201, 203, 207)'
                        ]
                    }]
                }
            });
        }

        // Initialize dashboard
        document.addEventListener('DOMContentLoaded', function() {
            loadDashboardData();
            initializeCharts();
            
            // Refresh data every 30 seconds
            setInterval(loadDashboardData, 30000);
        });
    </script>
</body>
</html>

let products = [
  { id: 'P1', name: '1000 ml Mustard Oil with Label', price: 200, stock: 100 },
  { id: 'P2', name: '500 ml Mustard Oil with Label', price: 110, stock: 100 },
  { id: 'P3', name: '900 ml Mustard Oil with Label', price: 180, stock: 100 },
  { id: 'P4', name: '450 ml Mustard Oil with Label', price: 100, stock: 100 },
  { id: 'P5', name: '1000 ml Mustard Oil without Label', price: 190, stock: 100 },
  { id: 'P6', name: '500 ml Mustard Oil without Label', price: 100, stock: 100 },
  { id: 'P7', name: '900 ml Mustard Oil without Label', price: 170, stock: 100 },
  { id: 'P8', name: '450 ml Mustard Oil without Label', price: 90, stock: 100 }
];
let materials = [
  { id: 'M1', name: 'Mustard Seeds', unit: 'kg', stock: 1000 },
  { id: 'M2', name: '1000 ml Bottles', unit: 'units', stock: 200 },
  { id: 'M3', name: '500 ml Bottles', unit: 'units', stock: 200 },
  { id: 'M4', name: '900 ml Bottles', unit: 'units', stock: 200 },
  { id: 'M5', name: '450 ml Bottles', unit: 'units', stock: 200 },
  { id: 'M6', name: 'Labels', unit: 'units', stock: 500 }
];
let clients = [];
let invoices = [];
let payments = [];
let expenses = []; // Simulated expenses

// Add sample expenses
function initializeExpenses() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  for (let i = 0; i < 10; i++) {
    expenses.push({
      id: 'E' + (i + 1),
      amount: Math.floor(Math.random() * 5000) + 1000,
      date: new Date(currentYear, currentMonth - Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0]
    });
  }
}
initializeExpenses();

function showTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  if (tabId === 'dashboard') loadDashboard();
  if (tabId === 'billing') loadBillingData();
  if (tabId === 'clients') loadClients();
  if (tabId === 'product-stock') loadProductStockProducts();
  if (tabId === 'raw-material-stock') loadRawMaterialStockMaterials();
  if (tabId === 'inventory') loadInventoryReport();
  if (tabId === 'payments') loadPaymentInvoices();
  if (tabId === 'sales') loadSalesReport();
}

function loadDashboard() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const financialYearStart = new Date(currentYear, 3, 1); // April 1
  if (currentMonth < 3) financialYearStart.setFullYear(currentYear - 1);

  const currentMonthRevenue = invoices
    .filter(i => {
      const date = new Date(i.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, i) => sum + i.total, 0);
  const currentFYRevenue = invoices
    .filter(i => {
      const date = new Date(i.date);
      return date >= financialYearStart && date <= now;
    })
    .reduce((sum, i) => sum + i.total, 0);
  const currentMonthExpenses = expenses
    .filter(e => {
      const date = new Date(e.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, e) => sum + e.amount, 0);
  const currentFYExpenses = expenses
    .filter(e => {
      const date = new Date(e.date);
      return date >= financialYearStart && date <= now;
    })
    .reduce((sum, e) => sum + e.amount, 0);
  const profit = (currentFYRevenue - currentFYExpenses).toFixed(2);

  document.getElementById('current-month-revenue').textContent = `₹${currentMonthRevenue.toFixed(2)}`;
  document.getElementById('current-fy-revenue').textContent = `₹${currentFYRevenue.toFixed(2)}`;
  document.getElementById('profit').textContent = `₹${profit}`;

  // Sales Trend Chart
  const ctx = document.getElementById('sales-trend-chart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Day 1', 'Day 5', 'Day 10', 'Day 15', 'Day 20', 'Day 25'],
      datasets: [{
        label: 'Sales Revenue (₹)',
        data: [
          invoices.filter(i => new Date(i.date).getDate() <= 1 && new Date(i.date).getMonth() === currentMonth).reduce((sum, i) => sum + i.total, 0),
          invoices.filter(i => new Date(i.date).getDate() <= 5 && new Date(i.date).getMonth() === currentMonth).reduce((sum, i) => sum + i.total, 0),
          invoices.filter(i => new Date(i.date).getDate() <= 10 && new Date(i.date).getMonth() === currentMonth).reduce((sum, i) => sum + i.total, 0),
          invoices.filter(i => new Date(i.date).getDate() <= 15 && new Date(i.date).getMonth() === currentMonth).reduce((sum, i) => sum + i.total, 0),
          invoices.filter(i => new Date(i.date).getDate() <= 20 && new Date(i.date).getMonth() === currentMonth).reduce((sum, i) => sum + i.total, 0),
          invoices.filter(i => new Date(i.date).getDate() <= 25 && new Date(i.date).getMonth() === currentMonth).reduce((sum, i) => sum + i.total, 0)
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.6)'
      }]
    },
    options: {
      scales: { y: { beginAtZero: true } },
      responsive: true
    }
  });

  loadDashboardContent();
}

function loadDashboardContent() {
  const productLow = products.filter(p => p.stock < 10);
  const productTotal = products.reduce((sum, p) => sum + p.stock, 0);
  const materialLow = materials.filter(m => m.stock < 10);
  const materialTotal = materials.reduce((sum, m) => sum + m.stock, 0);
  document.getElementById('dashboard-content').innerHTML += `
    <div class="bg-white p-4 rounded shadow">
      <h3 class="font-bold">Total Product Stock</h3>
      <p>${productTotal} units</p>
    </div>
    <div class="bg-white p-4 rounded shadow">
      <h3 class="font-bold">Product Low Stock Alerts</h3>
      <ul>${productLow.map(p => `<li>${p.name}: ${p.stock} units</li>`).join('')}</ul>
    </div>
    <div class="bg-white p-4 rounded shadow">
      <h3 class="font-bold">Total Raw Material Stock</h3>
      <p>${materialTotal} units/kg</p>
    </div>
    <div class="bg-white p-4 rounded shadow">
      <h3 class="font-bold">Raw Material Low Stock Alerts</h3>
      <ul>${materialLow.map(m => `<li>${m.name}: ${m.stock} ${m.unit}</li>`).join('')}</ul>
    </div>
  `;
}

function loadBillingData() {
  document.getElementById('invoice-client').innerHTML = '<option value="">Select Client</option>' + clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  document.querySelector('.product-select').innerHTML = '<option value="">Select Product</option>' + products.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
}

function addInvoiceItem() {
  const itemsDiv = document.getElementById('invoice-items');
  const newItem = document.createElement('div');
  newItem.className = 'flex gap-4 mb-2';
  newItem.innerHTML = `
    <select class="product-select w-2/3 p-2 border rounded">
      <option value="">Select Product</option>
      ${products.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
    </select>
    <input type="number" class="quantity-input w-1/3 p-2 border rounded" placeholder="Quantity" min="1">
  `;
  itemsDiv.appendChild(newItem);
}

function createInvoice() {
  const clientID = document.getElementById('invoice-client').value;
  const productSelects = document.querySelectorAll('.product-select');
  const quantities = document.querySelectorAll('.quantity-input');
  const products = Array.from(productSelects).map(s => s.value).filter(v => v);
  const qtys = Array.from(quantities).map(q => q.value).filter(v => v);
  if (!clientID || products.length === 0 || qtys.length !== products.length) {
    alert('Please select a client and at least one product with quantity');
    return;
  }
  const total = products.reduce((sum, id, i) => {
    const product = products.find(p => p.id === id);
    return sum + (product.price * qtys[i]);
  }, 0);
  const invoice = {
    id: 'INV' + (invoices.length + 1),
    clientID,
    products,
    quantities: qtys,
    total,
    date: new Date().toISOString().split('T')[0],
    status: 'Pending'
  };
  invoices.push(invoice);
  products.forEach((id, i) => {
    const product = products.find(p => p.id === id);
    product.stock -= Number(qtys[i]);
  });
  document.getElementById('invoice-result').innerHTML = `Invoice ${invoice.id} created successfully`;
  document.querySelectorAll('.quantity-input').forEach(q => q.value = '');
  loadBillingData();
  loadDashboard();
  loadInventoryReport();
}

function loadClients() {
  document.getElementById('client-list').innerHTML = `
    <table class="w-full border">
      <tr class="bg-gray-200"><th>Name</th><th>Contact</th><th>Address</th><th>Actions</th></tr>
      ${clients.map(c => `<tr><td>${c.name}</td><td>${c.contact}</td><td>${c.address}</td><td><button onclick="editClient('${c.id}')" class="text-blue-500">Edit</button></td></tr>`).join('')}
    </table>
  `;
}

function saveClient() {
  const client = {
    id: document.getElementById('client-id').value || 'C' + (clients.length + 1),
    name: document.getElementById('client-name').value,
    contact: document.getElementById('client-contact').value,
    address: document.getElementById('client-address').value
  };
  if (!client.name || !client.contact) {
    alert('Please enter client name and contact');
    return;
  }
  if (client.id.startsWith('C')) {
    clients.push(client);
  } else {
    const index = clients.findIndex(c => c.id === client.id);
    clients[index] = client;
  }
  document.getElementById('client-id').value = '';
  document.getElementById('client-name').value = '';
  document.getElementById('client-contact').value = '';
  document.getElementById('client-address').value = '';
  loadClients();
  loadBillingData();
}

function editClient(clientID) {
  const client = clients.find(c => c.id === clientID);
  document.getElementById('client-id').value = client.id;
  document.getElementById('client-name').value = client.name;
  document.getElementById('client-contact').value = client.contact;
  document.getElementById('client-address').value = client.address;
}

function loadProductStockProducts() {
  document.getElementById('product-stock-product').innerHTML = '<option value="">Select Product</option>' + products.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
}

function addProductStock() {
  const productID = document.getElementById('product-stock-product').value;
  const quantity = document.getElementById('product-stock-quantity').value;
  if (!productID || !quantity || quantity <= 0) {
    alert('Please select a product and enter a valid quantity');
    return;
  }
  const product = products.find(p => p.id === productID);
  product.stock += Number(quantity);
  document.getElementById('product-stock-result').innerHTML = 'Product stock updated';
  document.getElementById('product-stock-quantity').value = '';
  loadInventoryReport();
}

function loadRawMaterialStockMaterials() {
  document.getElementById('raw-material-stock-material').innerHTML = '<option value="">Select Raw Material</option>' + materials.map(m => `<option value="${m.id}">${m.name} (${m.unit})</option>`).join('');
}

function addRawMaterialStock() {
  const materialID = document.getElementById('raw-material-stock-material').value;
  const quantity = document.getElementById('raw-material-stock-quantity').value;
  if (!materialID || !quantity || quantity <= 0) {
    alert('Please select a raw material and enter a valid quantity');
    return;
  }
  const material = materials.find(m => m.id === materialID);
  material.stock += Number(quantity);
  document.getElementById('raw-material-stock-result').innerHTML = 'Raw material stock updated';
  document.getElementById('raw-material-stock-quantity').value = '';
  loadInventoryReport();
}

function loadInventoryReport() {
  document.getElementById('product-inventory-report').innerHTML = `
    <table class="w-full border">
      <tr class="bg-gray-200"><th>Product</th><th>Stock</th><th>Status</th></tr>
      ${products.map(p => `<tr><td>${p.name}</td><td>${p.stock}</td><td>${p.stock < 10 ? 'Low' : 'OK'}</td></tr>`).join('')}
    </table>
  `;
  document.getElementById('raw-material-inventory-report').innerHTML = `
    <table class="w-full border">
      <tr class="bg-gray-200"><th>Raw Material</th><th>Unit</th><th>Stock</th><th>Status</th></tr>
      ${materials.map(m => `<tr><td>${m.name}</td><td>${m.unit}</td><td>${m.stock}</td><td>${m.stock < 10 ? 'Low' : 'OK'}</td></tr>`).join('')}
    </table>
  `;
}

function loadPaymentInvoices() {
  document.getElementById('payment-invoice').innerHTML = '<option value="">Select Invoice</option>' + invoices.filter(i => i.status === 'Pending').map(i => `<option value="${i.id}">${i.id} - ${i.clientID}</option>`).join('');
}

function recordPayment() {
  const invoiceID = document.getElementById('payment-invoice').value;
  const amount = document.getElementById('payment-amount').value;
  if (!invoiceID || !amount || amount <= 0) {
    alert('Please select an invoice and enter a valid amount');
    return;
  }
  const invoice = invoices.find(i => i.id === invoiceID);
  payments.push({ id: 'PAY' + (payments.length + 1), invoiceID, amount, date: new Date().toISOString().split('T')[0] });
  const totalPaid = payments.filter(p => p.invoiceID === invoiceID).reduce((sum, p) => sum + Number(p.amount), 0);
  invoice.status = totalPaid >= invoice.total ? 'Paid' : 'Pending';
  document.getElementById('payment-result').innerHTML = 'Payment recorded';
  document.getElementById('payment-amount').value = '';
  loadPaymentInvoices();
}

function loadSalesReport() {
  const startDate = document.getElementById('sales-start-date').value;
  const endDate = document.getElementById('sales-end-date').value;
  const filteredInvoices = invoices.filter(i => {
    const date = new Date(i.date);
    return (!startDate || date >= new Date(startDate)) && (!endDate || date <= new Date(endDate));
  });
  document.getElementById('sales-report').innerHTML = `
    <table class="w-full border">
      <tr class="bg-gray-200"><th>Invoice</th><th>Client</th><th>Total</th><th>Date</th><th>Status</th></tr>
      ${filteredInvoices.map(i => `<tr><td>${i.id}</td><td>${i.clientID}</td><td>${i.total}</td><td>${i.date}</td><td>${i.status}</td></tr>`).join('')}
    </table>
  `;
}

function getSalesReport() {
  loadSalesReport();
}

// Load initial data
loadDashboard();

// Supabase configuration with your provided credentials
const supabaseUrl = 'https://vkkqvxofxkbvwgkijebs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZra3F2eG9meGtidndna2lqZWJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2ODY0OTUsImV4cCI6MjA2OTI2MjQ5NX0.eOyPCJxYbjxLAXAKEAe0LaNosaVx-gf54DaVodt0GcQ';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Local data caches
let clients = [];
let products = [];
let rawMaterials = [];
let productionOrders = [];
let invoices = [];
let payments = [];

async function loadData() {
  console.log("Loading data from Supabase...");
  try {
    const { data: clientData } = await supabase.from('clients').select('*');
    clients = clientData || [];
    const { data: productData } = await supabase.from('products').select('*');
    products = productData || [];
    const { data: materialData } = await supabase.from('raw_materials').select('*');
    rawMaterials = materialData || [];
    const { data: orderData } = await supabase.from('production_orders').select('*');
    productionOrders = orderData || [];
    const { data: invoiceData } = await supabase.from('invoices').select('*');
    invoices = invoiceData || [];
    const { data: paymentData } = await supabase.from('payments').select('*');
    payments = paymentData || [];
    console.log("Data loaded:", { clients, products, invoices });
    updateDashboard();
    displayClients();
    displayInventory();
    updateProductionSelect();
    updateSalesSelects();
    displayProductionOrders();
    displayInvoices();
  } catch (error) {
    console.error("Error loading data:", error.message);
  }
}

async function saveData(data, table) {
  console.log("Saving to", table, ":", data);
  try {
    const { error } = await supabase.from(table).upsert(data);
    if (error) throw error;
    console.log("Data saved to", table);
  } catch (error) {
    console.error("Error saving to", table, ":", error.message);
  }
}

// Tab navigation with animation
function showTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
  document.getElementById(tabId).classList.remove('hidden');
  if (tabId === 'dashboard') updateDashboard();
  if (tabId === 'clients') displayClients();
  if (tabId === 'inventory') displayInventory();
  if (tabId === 'production') displayProductionOrders();
  if (tabId === 'sales') displayInvoices();
  if (tabId === 'reports') updateReport();
}

// Dashboard update with real-time feel
function updateDashboard() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthlySales = invoices
    .filter(i => new Date(i.date).getMonth() === currentMonth && new Date(i.date).getFullYear() === currentYear)
    .reduce((sum, i) => sum + i.total, 0);
  const productionOutput = productionOrders
    .filter(o => new Date(o.date).getMonth() === currentMonth && new Date(o.date).getFullYear() === currentYear && o.status === 'Completed')
    .reduce((sum, o) => sum + o.quantity, 0);
  const stockValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0) + rawMaterials.reduce((sum, m) => sum + (m.stock * 10), 0);

  document.getElementById('monthly-sales').textContent = `₹${monthlySales.toFixed(2)}`;
  document.getElementById('production-output').textContent = `${productionOutput} units`;
  document.getElementById('stock-value').textContent = `₹${stockValue.toFixed(2)}`;
}

// Clients
async function saveClient() {
  const client = {
    id: document.getElementById('client-id').value || 'C' + (clients.length + 1),
    name: document.getElementById('client-name').value,
    contact: document.getElementById('client-contact').value,
    address: document.getElementById('client-address').value
  };
  if (!client.name || !client.contact) {
    alert('Please enter name and contact');
    return;
  }
  if (!client.id.startsWith('C')) {
    const index = clients.findIndex(c => c.id === client.id);
    clients[index] = client;
  } else {
    clients.push(client);
  }
  await saveData(client, 'clients');
  document.getElementById('client-id').value = '';
  document.getElementById('client-name').value = '';
  document.getElementById('client-contact').value = '';
  document.getElementById('client-address').value = '';
  displayClients();
  updateSalesSelects();
}

function displayClients() {
  document.getElementById('client-list').innerHTML = `
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <tr class="bg-blue-900 text-white"><th class="p-2">Name</th><th class="p-2">Contact</th><th class="p-2">Address</th><th class="p-2">Action</th></tr>
        ${clients.map(c => `
          <tr class="border-b border-gray-700">
            <td class="p-2">${c.name}</td><td class="p-2">${c.contact}</td><td class="p-2">${c.address}</td>
            <td class="p-2"><button onclick="editClient('${c.id}')" class="text-yellow-400 hover:text-yellow-300">Edit</button></td>
          </tr>
        `).join('')}
      </table>
    </div>`;
}

function editClient(clientId) {
  const client = clients.find(c => c.id === clientId);
  document.getElementById('client-id').value = client.id;
  document.getElementById('client-name').value = client.name;
  document.getElementById('client-contact').value = client.contact;
  document.getElementById('client-address').value = client.address;
}

// Inventory
function displayInventory() {
  document.getElementById('product-inventory').innerHTML = `
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <tr class="bg-blue-900 text-white"><th class="p-2">Product</th><th class="p-2">Stock</th></tr>
        ${products.map(p => `<tr class="border-b border-gray-700"><td class="p-2">${p.name}</td><td class="p-2">${p.stock}</td></tr>`).join('')}
      </table>
    </div>`;
  document.getElementById('raw-material-inventory').innerHTML = `
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <tr class="bg-blue-900 text-white"><th class="p-2">Material</th><th class="p-2">Stock</th></tr>
        ${rawMaterials.map(m => `<tr class="border-b border-gray-700"><td class="p-2">${m.name}</td><td class="p-2">${m.stock} ${m.unit}</td></tr>`).join('')}
      </table>
    </div>`;
}

// Production
function updateProductionSelect() {
  const select = document.getElementById('production-product');
  select.innerHTML = '<option value="">Select Product</option>';
  products.forEach(p => {
    const option = document.createElement('option');
    option.value = p.id;
    option.textContent = p.name;
    select.appendChild(option);
  });
}

async function createProductionOrder() {
  const productId = document.getElementById('production-product').value;
  const quantity = document.getElementById('production-quantity').value;
  if (!productId || !quantity || quantity <= 0) {
    alert('Please select a product and enter a valid quantity');
    return;
  }
  const order = {
    id: 'PO' + (productionOrders.length + 1),
    product_id: productId,
    quantity: parseInt(quantity),
    status: 'Pending'
  };
  productionOrders.push(order);
  await saveData(order, 'production_orders');
  document.getElementById('production-quantity').value = '';
  displayProductionOrders();
  updateDashboard();
}

function displayProductionOrders() {
  document.getElementById('production-list').innerHTML = `
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <tr class="bg-blue-900 text-white"><th class="p-2">Order ID</th><th class="p-2">Product</th><th class="p-2">Quantity</th><th class="p-2">Status</th></tr>
        ${productionOrders.map(o => {
          const product = products.find(p => p.id === o.product_id);
          return `<tr class="border-b border-gray-700"><td class="p-2">${o.id}</td><td class="p-2">${product ? product.name : 'N/A'}</td><td class="p-2">${o.quantity}</td><td class="p-2">${o.status}</td></tr>`;
        }).join('')}
      </table>
    </div>`;
}

// Sales
function updateSalesSelects() {
  const clientSelect = document.getElementById('sales-client');
  clientSelect.innerHTML = '<option value="">Select Client</option>';
  clients.forEach(c => {
    const option = document.createElement('option');
    option.value = c.id;
    option.textContent = c.name;
    clientSelect.appendChild(option);
  });
  const productSelect = document.getElementById('sales-product');
  productSelect.innerHTML = '<option value="">Select Product</option>';
  products.forEach(p => {
    const option = document.createElement('option');
    option.value = p.id;
    option.textContent = p.name;
    productSelect.appendChild(option);
  });
}

async function createInvoice() {
  const clientId = document.getElementById('sales-client').value;
  const productId = document.getElementById('sales-product').value;
  const quantity = document.getElementById('sales-quantity').value;
  if (!clientId || !productId || !quantity || quantity <= 0) {
    alert('Please fill all fields with valid values');
    return;
  }
  const product = products.find(p => p.id === productId);
  if (product.stock < quantity) {
    alert('Insufficient stock');
    return;
  }
  const total = product.price * quantity;
  const invoice = {
    id: 'INV' + (invoices.length + 1),
    client_id: clientId,
    product_id: productId,
    quantity: parseInt(quantity),
    total,
    status: 'Pending',
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  };
  invoices.push(invoice);
  product.stock -= quantity;
  await saveData(invoice, 'invoices');
  await saveData(products, 'products');
  document.getElementById('sales-quantity').value = '';
  displayInvoices();
  updateDashboard();
}

function displayInvoices() {
  document.getElementById('invoice-list').innerHTML = `
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <tr class="bg-blue-900 text-white"><th class="p-2">Invoice ID</th><th class="p-2">Client</th><th class="p-2">Product</th><th class="p-2">Quantity</th><th class="p-2">Total</th><th class="p-2">Status</th><th class="p-2">Due Date</th></tr>
        ${invoices.map(i => {
          const client = clients.find(c => c.id === i.client_id);
          const product = products.find(p => p.id === i.product_id);
          return `<tr class="border-b border-gray-700"><td class="p-2">${i.id}</td><td class="p-2">${client ? client.name : 'N/A'}</td><td class="p-2">${product ? product.name : 'N/A'}</td><td class="p-2">${i.quantity}</td><td class="p-2">₹${i.total}</td><td class="p-2">${i.status}</td><td class="p-2">${i.due_date}</td></tr>`;
        }).join('')}
      </table>
    </div>`;
}

// Reports
function updateReport() {
  document.getElementById('report-output').innerHTML = '<p class="text-gray-400">Select date range to generate report</p>';
}

function generateReport() {
  const startDate = document.getElementById('report-start-date').value;
  const endDate = document.getElementById('report-end-date').value;
  const filteredInvoices = invoices.filter(i => {
    const date = new Date(i.date);
    return (!startDate || date >= new Date(startDate)) && (!endDate || date <= new Date(endDate));
  });
  const totalSales = filteredInvoices.reduce((sum, i) => sum + i.total, 0);
  document.getElementById('report-output').innerHTML = `
    <h3 class="text-lg font-semibold gradient-text">Sales Report</h3>
    <p class="text-gray-300 mt-2">Total Sales: ₹${totalSales.toFixed(2)}</p>
    <div class="overflow-x-auto mt-4">
      <table class="w-full text-left">
        <tr class="bg-blue-900 text-white"><th class="p-2">Invoice</th><th class="p-2">Client</th><th class="p-2">Total</th><th class="p-2">Date</th></tr>
        ${filteredInvoices.map(i => {
          const client = clients.find(c => c.id === i.client_id);
          return `<tr class="border-b border-gray-700"><td class="p-2">${i.id}</td><td class="p-2">${client ? client.name : 'N/A'}</td><td class="p-2">₹${i.total}</td><td class="p-2">${i.date}</td></tr>`;
        }).join('')}
      </table>
    </div>`;
}

// Initialize
window.addEventListener('load', () => {
  loadData();
  showTab('dashboard');
});

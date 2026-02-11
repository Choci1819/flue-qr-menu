document.addEventListener('DOMContentLoaded', () => {
    // 1. Select DOM elements
    const menuIcon = document.getElementById('menu-icon');
    const navbar = document.querySelector('.navbar');
    
    const cardContainer = document.getElementById('category-cards-container');
    const menuDisplay = document.getElementById('menu-content-display');
    const backButton = document.getElementById('back-to-categories');
    const categoryTitle = document.getElementById('category-title');
    const categoryItemsList = document.getElementById('category-items-list');
    const cardBoxes = document.querySelectorAll('.card-box');

    // Cart elements & state
    const cartIcon = document.getElementById('cart-icon');
    const cartCountEl = document.getElementById('cart-count');
    const cartPanel = document.getElementById('cart-panel');
    let cart = {};
    let menuData = {};

    // 2. Load menu data
    function loadMenuData() {
        // fetch menuData.json from the js folder
        fetch('js/menuData.json') 
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load JSON: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                menuData = data;
            })
            .catch(error => {
                console.error('Error loading menu data:', error);
                // You may show a user-facing message here if desired:
                // alert('Menu data could not be loaded. Please check your connection.');
            });
    }

    // 3. Display category (updated)
    function displayCategory(categoryKey) {
        const categoryData = menuData[categoryKey];
        if (!categoryData) {
            console.error('Unknown category key:', categoryKey);
            return;
        }

        // Format category key into a readable title
        let displayTitle = categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);
        displayTitle = displayTitle.replace(/([A-Z])/g, ' $1').trim();
        displayTitle = displayTitle.replace('icecekler', 'İçecekler'); // Özel durum düzeltmesi

        categoryTitle.textContent = displayTitle;
        categoryItemsList.innerHTML = '';
        
        // Hide category cards, show menu display
        cardContainer.classList.add('hidden'); 
        menuDisplay.classList.remove('hidden'); 
        
        // Build menu items and attach images
        categoryData.forEach(item => {
            // Check image URL
            const hasImage = item.fotograf_url && item.fotograf_url.trim() !== '';

            const itemHTML = `
                <div class="menu-item ${hasImage ? 'with-image' : 'no-image'}">
                    
                    ${hasImage ? `
                        <div class="item-image-container">
                            <img src="${item.fotograf_url}" alt="${item.ad}" class="item-image">
                        </div>
                    ` : ''}

                    <div class="menu-item-content">
                        <div class="item-text-info">
                            <h3>${item.ad}</h3>
                            <p class="description">${item.aciklama}</p>
                        </div>
                                <p class="price">${item.fiyat}</p>
                                <button class="add-to-cart" data-name="${encodeURIComponent(item.ad)}" data-price="${encodeURIComponent(item.fiyat)}">Add to Cart</button>
                    </div>
                </div>
            `;
            categoryItemsList.innerHTML += itemHTML;
        });
        
        // Scroll menu area (useful on mobile)
        menuDisplay.scrollIntoView({ behavior: 'smooth' });

        // Wire up add-to-cart buttons for the newly rendered items
        const addButtons = categoryItemsList.querySelectorAll('.add-to-cart');
        addButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const name = decodeURIComponent(btn.dataset.name);
                const price = decodeURIComponent(btn.dataset.price);
                addToCart(name, price);
            });
        });
    }
    

    // 4. Event listeners

    // A. Toggle mobile menu
    menuIcon.addEventListener('click', () => {
        navbar.classList.toggle('active');
    });

    // B. Category card click handler
    cardBoxes.forEach(card => {
        card.addEventListener('click', function() {
            const categoryKey = this.getAttribute('data-category');
            if (categoryKey && menuData[categoryKey]) {
                displayCategory(categoryKey);
                // Close mobile menu if open
                navbar.classList.remove('active'); 
            }
        });
    });

    // C. Back button click handler
    backButton.addEventListener('click', function() {
        menuDisplay.classList.add('hidden'); // hide menu
        cardContainer.classList.remove('hidden'); // show category cards
        
        // Scroll to cards area
        cardContainer.scrollIntoView({ behavior: 'smooth' });
    });

    // Cart functions
    function loadCart() {
        try {
            const saved = localStorage.getItem('cart');
            cart = saved ? JSON.parse(saved) : {};
        } catch (e) {
            cart = {};
        }
        updateCartUI();
    }

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function addToCart(name, price) {
        if (!cart[name]) cart[name] = { name, price, qty: 0 };
        cart[name].qty += 1;
        saveCart();
        updateCartUI();
    }

    function removeFromCart(name) {
        if (!cart[name]) return;
        delete cart[name];
        saveCart();
        updateCartUI();
    }

    function updateCartUI() {
        const totalQty = Object.values(cart).reduce((s, it) => s + (it.qty || 0), 0);
        cartCountEl.textContent = totalQty;
        renderCartPanel();
    }

    function renderCartPanel() {
        const items = Object.values(cart);
        if (!cartPanel) return;
        if (items.length === 0) {
            cartPanel.innerHTML = '<div class="cart-empty">Cart is empty</div>';
            return;
        }
        let html = '<div class="cart-panel-inner">';
        html += '<h4 style="margin:0 0 8px 0">Cart</h4>';
        items.forEach(it => {
            html += `<div class="cart-item"><div>${it.name} ${it.qty>1? 'x'+it.qty:''}</div><div>${it.price}</div><button data-remove="${encodeURIComponent(it.name)}" style="margin-left:8px">Remove</button></div>`;
        });
        html += '<div style="margin-top:8px"><label style="font-size:0.9rem;margin-right:6px">Table:</label><input id="cart-table-number" placeholder="e.g. 12" style="width:60px;padding:4px;border-radius:4px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:#fff"></div>';
        html += '<div class="cart-actions"><button id="cart-clear">Clear</button><button class="secondary" id="cart-checkout">Checkout</button></div>';
        html += '</div>';
        cartPanel.innerHTML = html;

        // wire remove buttons
        cartPanel.querySelectorAll('[data-remove]').forEach(b => {
            b.addEventListener('click', () => {
                const name = decodeURIComponent(b.dataset.remove);
                removeFromCart(name);
            });
        });
        const clearBtn = cartPanel.querySelector('#cart-clear');
        if (clearBtn) clearBtn.addEventListener('click', () => { cart = {}; saveCart(); updateCartUI(); });
        const checkoutBtn = cartPanel.querySelector('#cart-checkout');
        if (checkoutBtn) checkoutBtn.addEventListener('click', () => {
            const tableInput = cartPanel.querySelector('#cart-table-number');
            const table = tableInput ? tableInput.value.trim() : '';
            if (!table) { alert('Please enter table number before checkout.'); return; }
            // build order
            const orderItems = Object.values(cart).map(it => ({ name: it.name, price: it.price, qty: it.qty }));
            const order = {
                id: 'ord_' + Date.now(),
                table: table,
                items: orderItems,
                totalQty: orderItems.reduce((s,i)=>s+(i.qty||0),0),
                createdAt: new Date().toISOString()
            };
            // save to orders list in localStorage
            try {
                const existing = JSON.parse(localStorage.getItem('orders')||'[]');
                existing.push(order);
                localStorage.setItem('orders', JSON.stringify(existing));
            } catch (e) {
                console.error('Saving order failed', e);
            }
            // clear cart and give feedback
            cart = {};
            saveCart();
            updateCartUI();
            alert('Order sent to kitchen (admin).');
        });
    }

    if (cartIcon) {
        cartIcon.addEventListener('click', () => {
            if (!cartPanel) return;
            cartPanel.classList.toggle('hidden');
            const isHidden = cartPanel.classList.contains('hidden');
            cartPanel.setAttribute('aria-hidden', isHidden ? 'true' : 'false');
        });
    }

    // Initialize app
    loadMenuData();
    loadCart();
});
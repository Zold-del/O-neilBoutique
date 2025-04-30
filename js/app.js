// Configuration
const BOT_API_URL = 'http://control.katabump.com/server/4f262838'; // URL du bot Discord hébergé sur KataBump

// Structure des données
let products = [
    {
        id: 1,
        name: 'Salades',
        price: 5,
        stock: 50,
        image: 'https://img.freepik.com/free-photo/green-lettuce-wooden-surface_144627-15161.jpg',
        promo: 0 // pourcentage de réduction
    },
    {
        id: 2,
        name: 'Tomates',
        price: 5,
        stock: 40,
        image: 'https://img.freepik.com/free-photo/tomatoes_144627-15411.jpg',
        promo: 0
    },
    {
        id: 3,
        name: 'Oignons',
        price: 5,
        stock: 30,
        image: 'https://img.freepik.com/free-photo/onions-wooden-bowl-wooden-table_1150-35825.jpg',
        promo: 0
    },
    {
        id: 4,
        name: 'Carottes',
        price: 5,
        stock: 35,
        image: 'https://img.freepik.com/free-photo/carrots-isolated-white-background_93675-129318.jpg',
        promo: 0
    },
    {
        id: 5,
        name: 'Fraises',
        price: 8,
        stock: 25,
        image: 'https://img.freepik.com/free-photo/strawberry-isolated-white-background_93675-131270.jpg',
        promo: 0
    },
    {
        id: 6,
        name: 'Lait',
        price: 7,
        stock: 20,
        image: 'https://img.freepik.com/free-photo/milk-glass-jug-wooden-table_1150-17625.jpg', 
        promo: 0
    },
    {
        id: 7,
        name: 'Courges',
        price: 8,
        stock: 15,
        image: 'https://img.freepik.com/free-photo/pumpkin-wooden-table_144627-12362.jpg',
        promo: 0
    },
    {
        id: 8,
        name: 'Blé',
        price: 6,
        stock: 45,
        image: 'https://img.freepik.com/free-photo/wheat-spikelets-grain-sack-wooden-table_93675-131606.jpg',
        promo: 0
    },
    {
        id: 9,
        name: 'Bananes',
        price: 7,
        stock: 30,
        image: 'https://img.freepik.com/free-photo/bunch-bananas-isolated-white-background_93675-136911.jpg',
        promo: 0
    },
    {
        id: 10,
        name: 'Agaves',
        price: 7,
        stock: 15,
        image: 'https://img.freepik.com/free-photo/agave-plant-pot-isolated-white-background_93675-130934.jpg',
        promo: 0
    },
    {
        id: 11,
        name: 'Pommes de terres',
        price: 6,
        stock: 40,
        image: 'https://img.freepik.com/free-photo/raw-potatoes-white-surface_144627-45342.jpg',
        promo: 0
    },
    {
        id: 12,
        name: 'Oeufs',
        price: 7,
        stock: 25,
        image: 'https://img.freepik.com/free-photo/eggs-wooden-bowl-wooden-table_1150-38352.jpg',
        promo: 0
    },
    {
        id: 13,
        name: 'Fertilisants',
        price: 250,
        stock: 10,
        image: 'https://img.freepik.com/free-photo/fertilizer-bag-gardening-tools_23-2148745762.jpg',
        promo: 0
    }
];

// Panier
let cart = [];

// Captcha simple
let captchaResult = 0;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    // Charger les produits
    renderProducts();
    
    // Charger le captcha
    generateCaptcha();
    
    // Event listeners
    const orderForm = document.getElementById('order-form');
    if (orderForm) {
        orderForm.addEventListener('submit', handleOrderSubmit);
    }
    
    // Vérifier la connexion avec le bot Discord
    checkBotStatus();
    
    // Check for any active promotions
    checkActivePromotions();
});

// Vérifier le statut du bot Discord
async function checkBotStatus() {
    try {
        const response = await fetch(`${BOT_API_URL}/api/status`);
        const data = await response.json();
        
        const statusDot = document.getElementById('bot-status-dot');
        const statusText = document.getElementById('bot-status');
        
        if (data.status === 'online') {
            statusDot.className = 'status-dot status-online';
            statusText.textContent = 'Connecté au serveur';
        } else {
            statusDot.className = 'status-dot status-offline';
            statusText.textContent = 'Déconnecté du serveur';
        }
    } catch (error) {
        console.error('Erreur lors de la vérification du statut du bot:', error);
        const statusDot = document.getElementById('bot-status-dot');
        const statusText = document.getElementById('bot-status');
        
        statusDot.className = 'status-dot status-offline';
        statusText.textContent = 'Impossible de se connecter au serveur';
    }
}

// Vérifier les promotions actives
async function checkActivePromotions() {
    try {
        const response = await fetch(`${BOT_API_URL}/api/promotions`);
        const promos = await response.json();
        
        if (promos && promos.length > 0) {
            // Mettre à jour les promotions dans les produits
            promos.forEach(promo => {
                const product = products.find(p => p.name.toLowerCase() === promo.fruit.toLowerCase());
                if (product) {
                    product.promo = promo.discount;
                }
            });
            
            // Afficher une notification
            const promoNotification = document.getElementById('promo-notification');
            promoNotification.textContent = `🔥 Promotions actives sur certains fruits!`;
            promoNotification.style.color = '#dc3545';
            promoNotification.style.fontWeight = 'bold';
            
            // Rafraîchir l'affichage des produits
            renderProducts();
        }
    } catch (error) {
        console.error('Erreur lors de la vérification des promotions:', error);
    }
}

// Afficher les produits
function renderProducts() {
    const productsContainer = document.getElementById('products-container');
    productsContainer.innerHTML = '';
    
    products.forEach(product => {
        const finalPrice = product.promo > 0 
            ? (product.price - (product.price * product.promo / 100)).toFixed(2) 
            : product.price.toFixed(2);
        
        const productElement = document.createElement('div');
        productElement.className = 'product-card';
        productElement.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div>
                    <span class="product-price">${finalPrice}$</span>
                    ${product.promo > 0 ? `<span class="product-promo">-${product.promo}%</span>` : ''}
                </div>
                <div class="product-stock">Stock: ${product.stock}</div>
                <div class="quantity-selector">
                    <button class="quantity-btn" onclick="decrementQuantity(${product.id})">-</button>
                    <input type="number" min="0" max="${product.stock}" value="0" class="quantity-input" id="quantity-${product.id}" onchange="updateCart(${product.id}, this.value)">
                    <button class="quantity-btn" onclick="incrementQuantity(${product.id})">+</button>
                </div>
            </div>
        `;
        
        productsContainer.appendChild(productElement);
    });
}

// Incrémenter la quantité d'un produit
function incrementQuantity(productId) {
    const input = document.getElementById(`quantity-${productId}`);
    const product = products.find(p => p.id === productId);
    
    if (parseInt(input.value) < product.stock) {
        input.value = parseInt(input.value) + 1;
        updateCart(productId, input.value);
    }
}

// Décrémenter la quantité d'un produit
function decrementQuantity(productId) {
    const input = document.getElementById(`quantity-${productId}`);
    
    if (parseInt(input.value) > 0) {
        input.value = parseInt(input.value) - 1;
        updateCart(productId, input.value);
    }
}

// Mettre à jour le panier
function updateCart(productId, quantity) {
    quantity = parseInt(quantity);
    const product = products.find(p => p.id === productId);
    
    // Vérifier si le produit est déjà dans le panier
    const existingCartItem = cart.find(item => item.productId === productId);
    
    if (existingCartItem) {
        if (quantity > 0) {
            existingCartItem.quantity = quantity;
        } else {
            // Supprimer l'élément si la quantité est 0
            cart = cart.filter(item => item.productId !== productId);
        }
    } else if (quantity > 0) {
        // Ajouter un nouvel élément au panier
        cart.push({
            productId,
            name: product.name,
            price: product.promo > 0 
                ? (product.price - (product.price * product.promo / 100))
                : product.price,
            quantity
        });
    }
    
    // Mettre à jour l'affichage du panier
    renderCart();
}

// Afficher le panier
function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Votre panier est vide.</p>';
        cartTotalElement.textContent = '0';
        return;
    }
    
    let cartHtml = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        cartHtml += `
            <div class="cart-item">
                <div>${item.name} x ${item.quantity}</div>
                <div>${itemTotal.toFixed(2)}$</div>
            </div>
        `;
    });
    
    cartItemsContainer.innerHTML = cartHtml;
    cartTotalElement.textContent = total.toFixed(2);
}

// Générer un captcha simple
function generateCaptcha() {
    const captchaContainer = document.getElementById('captcha-container');
    
    // Générer deux nombres aléatoires entre 1 et 10
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    captchaResult = num1 + num2;
    
    captchaContainer.innerHTML = `
        <label>Captcha: Combien font ${num1} + ${num2}?</label>
        <input type="number" id="captcha-input" required>
    `;
}

// Gérer la soumission de la commande
async function handleOrderSubmit(e) {
    e.preventDefault();
    
    // Vérifier que le panier n'est pas vide
    if (cart.length === 0) {
        alert('Votre panier est vide. Veuillez ajouter des produits avant de commander.');
        return;
    }
    
    // Vérifier le captcha
    const captchaInput = document.getElementById('captcha-input');
    if (parseInt(captchaInput.value) !== captchaResult) {
        alert('Captcha incorrect. Veuillez réessayer.');
        generateCaptcha();
        return;
    }
    
    // Récupérer les informations du formulaire
    const rpName = document.getElementById('rp-name').value;
    const rpPhone = document.getElementById('rp-phone').value;
    const discordUsername = document.getElementById('discord-username').value;
    
    // Créer l'objet de commande
    const orderData = {
        customer: {
            rpName,
            rpPhone,
            discordUsername
        },
        items: cart.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            total: (item.price * item.quantity).toFixed(2)
        })),
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2),
        timestamp: new Date().toISOString()
    };
    
    try {
        // Envoyer la commande au bot Discord
        const response = await fetch(`${BOT_API_URL}/api/create-order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`Commande envoyée avec succès! Numéro de commande: ${result.orderId}`);
            
            // Réinitialiser le formulaire et le panier
            document.getElementById('order-form').reset();
            cart = [];
            renderCart();
            generateCaptcha();
        } else {
            alert(`Erreur lors de l'envoi de la commande: ${result.error}`);
        }
    } catch (error) {
        console.error('Erreur lors de l\'envoi de la commande:', error);
        alert('Erreur lors de l\'envoi de la commande. Veuillez réessayer plus tard.');
    }
}

// Mettre à jour les stocks via l'API
async function updateProductStocks() {
    try {
        const response = await fetch(`${BOT_API_URL}/api/products`);
        const updatedProducts = await response.json();
        
        // Mettre à jour les stocks locaux
        updatedProducts.forEach(updatedProduct => {
            const product = products.find(p => p.name.toLowerCase() === updatedProduct.name.toLowerCase());
            if (product) {
                product.stock = updatedProduct.stock;
                if (updatedProduct.promo !== undefined) {
                    product.promo = updatedProduct.promo;
                }
            }
        });
        
        // Rafraîchir l'affichage des produits
        renderProducts();
    } catch (error) {
        console.error('Erreur lors de la mise à jour des stocks:', error);
    }
}

// Vérifier régulièrement les mises à jour de stock et de statut
setInterval(() => {
    checkBotStatus();
    updateProductStocks();
    checkActivePromotions();
}, 30000); // Toutes les 30 secondes
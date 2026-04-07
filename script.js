// ============================
// VARIABLES GLOBALES
// ============================
let productos = [];
let carrito = [];
const cartCount = document.getElementById('cart-count');
const cartModal = document.getElementById('cart-modal');
const closeModalBtn = document.querySelector('.close-modal');
const navCart = document.querySelector('.nav-cart');
const filterbotones = document.querySelectorAll('.filter-btn');
let filtroActivo = 'todos';

// ============================
// INICIALIZACIÓN
// ============================
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    configurarEventos();
});

// ============================
// CARGAR PRODUCTOS DESDE JSON
// ============================
async function cargarProductos() {
    try {
        const respuesta = await fetch('products.json');
        const datos = await respuesta.json();
        productos = datos.productos;
        mostrarProductos(productos);
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}

// ============================
// MOSTRAR PRODUCTOS EN GRID
// ============================
function mostrarProductos(productosAMostrar) {
    const grid = document.getElementById('productos-grid');
    grid.innerHTML = '';

    productosAMostrar.forEach((producto, index) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image" style="background: ${producto.imagen};">
                <i class="${producto.icono}"></i>
            </div>
            <div class="product-info">
                <p class="product-category">${producto.categoria}</p>
                <h3 class="product-name">${producto.nombre}</h3>
                <p class="product-description">${producto.descripcion}</p>
                <div class="product-footer">
                    <span class="product-price">$${producto.precio.toFixed(2)}</span>
                    <button class="add-to-cart-btn" data-id="${producto.id}">
                        <i class="fas fa-shopping-bag"></i> Añadir
                    </button>
                </div>
            </div>
        `;

        // Animación de entrada escalonada
        card.style.animationDelay = `${index * 0.1}s`;

        card.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart-btn')) {
                agregarAlCarrito(producto.id);
                mostrarNotificacion(e.target.closest('.add-to-cart-btn'));
            }
        });

        grid.appendChild(card);
    });
}

// ============================
// FILTRAR PRODUCTOS
// ============================
function filtrarProductos(categoria) {
    if (categoria === 'todos') {
        mostrarProductos(productos);
    } else {
        const productosFiltrados = productos.filter(p => p.categoria === categoria);
        mostrarProductos(productosFiltrados);
    }
}

// ============================
// AGREGAR AL CARRITO
// ============================
function agregarAlCarrito(id) {
    const producto = productos.find(p => p.id === id);
    
    const itemCarrito = carrito.find(item => item.id === id);
    
    if (itemCarrito) {
        itemCarrito.cantidad++;
    } else {
        carrito.push({
            ...producto,
            cantidad: 1
        });
    }

    actualizarCarrito();
}

// ============================
// ELIMINAR DEL CARRITO
// ============================
function eliminarDelCarrito(id) {
    carrito = carrito.filter(item => item.id !== id);
    actualizarCarrito();
    mostrarCarrito();
}

// ============================
// ACTUALIZAR CARRITO
// ============================
function actualizarCarrito() {
    const total = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    cartCount.textContent = total;

    // Guardar carrito en localStorage
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

// ============================
// MOSTRAR CARRITO EN MODAL
// ============================
function mostrarCarrito() {
    const cartItems = document.getElementById('cart-items');
    const totalPrice = document.getElementById('total-price');

    if (carrito.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">Tu carrito está vacío</div>';
        totalPrice.textContent = '0.00';
        return;
    }

    let html = '';
    let total = 0;

    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;

        html += `
            <div class="cart-item">
                <div>
                    <p class="cart-item-name">${item.nombre}</p>
                    <small>Cantidad: ${item.cantidad}</small>
                </div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <span class="cart-item-price">$${subtotal.toFixed(2)}</span>
                    <button class="remove-from-cart" onclick="eliminarDelCarrito(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });

    cartItems.innerHTML = html;
    totalPrice.textContent = total.toFixed(2);
}

// ============================
// NOTIFICACIÓN AL AGREGAR
// ============================
function mostrarNotificacion(btn) {
    const notificacion = document.createElement('div');
    notificacion.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--primary-color);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        font-weight: 600;
        z-index: 3000;
        animation: slideInRight 0.3s ease;
    `;
    notificacion.textContent = '✓ Añadido al carrito';
    document.body.appendChild(notificacion);

    setTimeout(() => {
        notificacion.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notificacion.remove(), 300);
    }, 2000);
}

// ============================
// CONFIGURAR EVENTOS
// ============================
function configurarEventos() {
    // Hamburger Menu
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Cerrar menú al hacer clic en un link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // Botones de filtro
    filterbotones.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.filter-btn.active').classList.remove('active');
            btn.classList.add('active');
            filtroActivo = btn.getAttribute('data-filter');
            filtrarProductos(filtroActivo);
        });
    });

    // Carrito
    navCart.addEventListener('click', () => {
        cartModal.classList.add('active');
        mostrarCarrito();
    });

    closeModalBtn.addEventListener('click', () => {
        cartModal.classList.remove('active');
    });

    cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.classList.remove('active');
        }
    });

    // Cargar carrito guardado
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
        actualizarCarrito();
    }
}

// ============================
// ANIMACIONES AL SCROLL
// ============================
document.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    
    if (window.scrollY > 100) {
        navbar.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
    }
});

// ============================
// EFECTO PARALLAX EN SHAPES
// ============================
document.addEventListener('mousemove', (e) => {
    const shapes = document.querySelectorAll('.shape');
    const x = (e.clientX / window.innerWidth) * 10;
    const y = (e.clientY / window.innerHeight) * 10;

    shapes.forEach((shape, index) => {
        shape.style.transform = `translateX(${x * (index + 1)}px) translateY(${y * (index + 1)}px)`;
    });
});

// ============================
// ANIMACIONES CSS EN JAVASCRIPT
// ============================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(50px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(50px);
        }
    }
`;
document.head.appendChild(style);

// ============================
// PREVENIR ENVÍO DEL FORMULARIO
// ============================
document.querySelector('.newsletter-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = e.target.querySelector('input');
    const email = input.value;
    
    if (email) {
        input.value = '';
        // Aquí iría la lógica para enviar el email (backend)
    }
});

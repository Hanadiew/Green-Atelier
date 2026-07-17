import { ref, computed } from 'vue'

export const cartItems = ref([])

export const cartCount = computed(() => cartItems.value.length)

export const cartSubtotal = computed(() =>
  cartItems.value.reduce((sum, item) => sum + item.price, 0)
)

export const addToCart = (product) => {
  const exists = cartItems.value.find(i => i.id === product.id)
  if (!exists) {
    cartItems.value.push({ ...product })
  }
}

export const removeFromCart = (id) => {
  cartItems.value = cartItems.value.filter(i => i.id !== id)
}

export const clearCart = () => {
  cartItems.value = []
}
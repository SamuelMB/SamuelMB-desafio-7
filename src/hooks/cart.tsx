import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const STORAGE = '@GoMarketPlace:products';

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // await AsyncStorage.clear();
      const products = await AsyncStorage.getItem(STORAGE);

      if (products != null) {
        setProducts(JSON.parse(products));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productIndex = products.findIndex(
        productStored => productStored.id === product.id,
      );

      if (productIndex >= 0) {
        const productsUpdated = products.map(productStored => {
          return productStored.id === product.id
            ? { ...productStored, quantity: productStored.quantity + 1 }
            : productStored;
        });
        setProducts(productsUpdated);
      } else {
        setProducts([...products, { ...product, quantity: 1 } as Product]);
      }

      await AsyncStorage.setItem(STORAGE, JSON.stringify(products));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      if (products) {
        const productsIncremented = products.map(productStored => {
          return productStored.id === id
            ? { ...productStored, quantity: productStored.quantity + 1 }
            : productStored;
        });
        setProducts(productsIncremented);
        await AsyncStorage.setItem(STORAGE, JSON.stringify(products));
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      if (products) {
        const productsDecremented = products.map(productStored => {
          return productStored.id === id
            ? { ...productStored, quantity: productStored.quantity - 1 }
            : productStored;
        });
        setProducts(productsDecremented);
        await AsyncStorage.setItem(STORAGE, JSON.stringify(products));
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };

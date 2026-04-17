import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Role = 'customer' | 'restaurant' | 'delivery' | 'admin';
type Mood = 'Happy' | 'Stressed' | 'Tired' | 'Energetic' | 'Focused';
type DeliveryStatus = 'Preparing' | 'Out for delivery' | 'Delivered';

type MenuItem = {
  id: string;
  name: string;
  restaurantId: string;
  restaurantName: string;
  price: number;
  calories: number;
  moodFit: Mood[];
  description: string;
};

type CartItem = MenuItem & {
  quantity: number;
};

type Order = {
  id: string;
  customerName: string;
  restaurantId: string;
  restaurantName: string;
  items: CartItem[];
  total: number;
  mood: Mood;
  deliveryAddress: string;
  deliveryPartner: string;
  status: DeliveryStatus;
};

const MOODS: Mood[] = ['Happy', 'Stressed', 'Tired', 'Energetic', 'Focused'];
const ROLES: { key: Role; label: string }[] = [
  { key: 'customer', label: 'Customer' },
  { key: 'restaurant', label: 'Restaurant' },
  { key: 'delivery', label: 'Delivery' },
  { key: 'admin', label: 'Admin' },
];

const MENU: MenuItem[] = [
  {
    id: 'm1',
    name: 'Rainbow Veggie Bowl',
    restaurantId: 'r1',
    restaurantName: 'Green Kitchen',
    price: 189,
    calories: 420,
    moodFit: ['Focused', 'Happy'],
    description: 'Fresh grains, avocado, chickpeas, and citrus dressing.',
  },
  {
    id: 'm2',
    name: 'Comfort Paneer Wrap',
    restaurantId: 'r1',
    restaurantName: 'Green Kitchen',
    price: 159,
    calories: 520,
    moodFit: ['Stressed', 'Tired'],
    description: 'Warm paneer wrap with veggies and yogurt mint sauce.',
  },
  {
    id: 'm3',
    name: 'Power Protein Shake',
    restaurantId: 'r2',
    restaurantName: 'Fit Fuel',
    price: 129,
    calories: 310,
    moodFit: ['Energetic', 'Focused'],
    description: 'Banana, whey, oats, peanut butter, and cocoa.',
  },
  {
    id: 'm4',
    name: 'Berry Mood Booster',
    restaurantId: 'r2',
    restaurantName: 'Fit Fuel',
    price: 149,
    calories: 280,
    moodFit: ['Happy', 'Tired'],
    description: 'Berry smoothie with yogurt, chia seeds, and honey.',
  },
  {
    id: 'm5',
    name: 'Spicy Chicken Rice Box',
    restaurantId: 'r3',
    restaurantName: 'Urban Bites',
    price: 219,
    calories: 640,
    moodFit: ['Energetic', 'Happy'],
    description: 'Grilled chicken, rice, sauteed veggies, and spicy sauce.',
  },
  {
    id: 'm6',
    name: 'Calm Coconut Curry',
    restaurantId: 'r3',
    restaurantName: 'Urban Bites',
    price: 199,
    calories: 560,
    moodFit: ['Stressed', 'Focused'],
    description: 'Mild coconut curry with steamed rice and vegetables.',
  },
];

const DELIVERY_PARTNERS = ['Arjun', 'Maya', 'Ravi'];

const currency = (value: number) => `Rs. ${value.toFixed(0)}`;

const getMoodInsight = (mood: Mood) => {
  switch (mood) {
    case 'Happy':
      return 'Balanced and colorful meals keep the energy high without slowing you down.';
    case 'Stressed':
      return 'Comforting meals with steady carbs and warm flavors can feel grounding.';
    case 'Tired':
      return 'Lighter meals and fruit-based shakes can help avoid a heavy post-meal crash.';
    case 'Energetic':
      return 'Protein-rich choices help sustain activity and reduce sudden hunger.';
    case 'Focused':
      return 'Clean meals with moderate calories help maintain attention through work or study.';
  }
};

const getRecommendationScore = (item: MenuItem, mood: Mood, search: string) => {
  let score = item.moodFit.includes(mood) ? 5 : 0;
  const normalizedSearch = search.trim().toLowerCase();

  if (normalizedSearch) {
    if (item.name.toLowerCase().includes(normalizedSearch)) {
      score += 2;
    }
    if (item.restaurantName.toLowerCase().includes(normalizedSearch)) {
      score += 1;
    }
  }

  if (mood === 'Tired' && item.calories < 450) {
    score += 1;
  }
  if (mood === 'Energetic' && item.calories >= 300) {
    score += 1;
  }
  if (mood === 'Focused' && item.calories <= 500) {
    score += 1;
  }

  return score;
};

export default function App() {
  const [role, setRole] = useState<Role>('customer');
  const [mood, setMood] = useState<Mood>('Focused');
  const [search, setSearch] = useState('');
  const [customerName, setCustomerName] = useState('Venkat');
  const [address, setAddress] = useState('Cambridge Institute of Technology, Bengaluru');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ORD-101',
      customerName: 'Naveen',
      restaurantId: 'r1',
      restaurantName: 'Green Kitchen',
      items: [
        { ...MENU[0], quantity: 1 },
        { ...MENU[1], quantity: 1 },
      ],
      total: MENU[0].price + MENU[1].price,
      mood: 'Focused',
      deliveryAddress: 'VV Puram, Bengaluru',
      deliveryPartner: 'Arjun',
      status: 'Preparing',
    },
    {
      id: 'ORD-102',
      customerName: 'Harish',
      restaurantId: 'r2',
      restaurantName: 'Fit Fuel',
      items: [{ ...MENU[2], quantity: 2 }],
      total: MENU[2].price * 2,
      mood: 'Energetic',
      deliveryAddress: 'Indiranagar, Bengaluru',
      deliveryPartner: 'Maya',
      status: 'Out for delivery',
    },
  ]);

  const recommendedItems = useMemo(() => {
    return [...MENU]
      .filter((item) => {
        const normalizedSearch = search.trim().toLowerCase();
        if (!normalizedSearch) {
          return true;
        }

        return (
          item.name.toLowerCase().includes(normalizedSearch) ||
          item.restaurantName.toLowerCase().includes(normalizedSearch)
        );
      })
      .sort(
        (a, b) =>
          getRecommendationScore(b, mood, search) - getRecommendationScore(a, mood, search)
      );
  }, [mood, search]);

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const addToCart = (item: MenuItem) => {
    setCart((currentCart) => {
      const existing = currentCart.find((entry) => entry.id === item.id);
      if (existing) {
        return currentCart.map((entry) =>
          entry.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry
        );
      }

      return [...currentCart, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, nextQuantity: number) => {
    setCart((currentCart) =>
      currentCart
        .map((entry) => (entry.id === itemId ? { ...entry, quantity: nextQuantity } : entry))
        .filter((entry) => entry.quantity > 0)
    );
  };

  const placeOrder = () => {
    if (!cart.length) {
      return;
    }

    const primaryRestaurant = cart[0].restaurantId;
    const restaurantName = cart[0].restaurantName;
    const assignedPartner =
      DELIVERY_PARTNERS[orders.length % DELIVERY_PARTNERS.length] ?? DELIVERY_PARTNERS[0];

    const newOrder: Order = {
      id: `ORD-${100 + orders.length + 1}`,
      customerName,
      restaurantId: primaryRestaurant,
      restaurantName,
      items: cart,
      total: cartTotal,
      mood,
      deliveryAddress: address,
      deliveryPartner: assignedPartner,
      status: 'Preparing',
    };

    setOrders((currentOrders) => [newOrder, ...currentOrders]);
    setCart([]);
  };

  const advanceOrderStatus = (orderId: string) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) => {
        if (order.id !== orderId) {
          return order;
        }

        if (order.status === 'Preparing') {
          return { ...order, status: 'Out for delivery' };
        }
        if (order.status === 'Out for delivery') {
          return { ...order, status: 'Delivered' };
        }

        return order;
      })
    );
  };

  const customerOrders = orders.filter((order) => order.customerName === customerName);
  const restaurantOrders = orders.filter((order) => order.restaurantId === 'r1');
  const deliveryOrders = orders.filter((order) => order.deliveryPartner === 'Arjun');
  const deliveredCount = orders.filter((order) => order.status === 'Delivered').length;
  const revenue = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>AI Food Delivery System</Text>
          <Text style={styles.title}>One cross-platform app for web and mobile</Text>
          <Text style={styles.subtitle}>
            Mood-based food recommendations, customer ordering, restaurant handling, delivery
            tracking, and admin analytics in a single Expo project.
          </Text>
        </View>

        <View style={styles.roleRow}>
          {ROLES.map((item) => (
            <Chip
              key={item.key}
              label={item.label}
              active={role === item.key}
              onPress={() => setRole(item.key)}
            />
          ))}
        </View>

        {role === 'customer' ? (
          <>
            <Card>
              <SectionTitle
                title="Customer profile"
                caption="Use this area like a lightweight login/profile form for the demo."
              />
              <View style={styles.inputGrid}>
                <Field
                  label="Name"
                  value={customerName}
                  onChangeText={setCustomerName}
                  placeholder="Enter customer name"
                />
                <Field
                  label="Delivery address"
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Enter delivery location"
                />
              </View>
            </Card>

            <Card>
              <SectionTitle
                title="Mood-based recommendations"
                caption={getMoodInsight(mood)}
              />
              <View style={styles.chipWrap}>
                {MOODS.map((item) => (
                  <Chip
                    key={item}
                    label={item}
                    active={mood === item}
                    onPress={() => setMood(item)}
                  />
                ))}
              </View>
              <Field
                label="Search meals or restaurants"
                value={search}
                onChangeText={setSearch}
                placeholder="Try bowl, shake, curry..."
              />
              <View style={styles.list}>
                {recommendedItems.map((item) => {
                  const recommended = item.moodFit.includes(mood);
                  return (
                    <View key={item.id} style={styles.itemCard}>
                      <View style={styles.itemHeader}>
                        <View style={styles.itemInfo}>
                          <Text style={styles.itemTitle}>{item.name}</Text>
                          <Text style={styles.itemMeta}>
                            {item.restaurantName} | {item.calories} kcal
                          </Text>
                        </View>
                        <Text style={styles.price}>{currency(item.price)}</Text>
                      </View>
                      <Text style={styles.itemDescription}>{item.description}</Text>
                      <View style={styles.itemFooter}>
                        <Text style={recommended ? styles.tagRecommended : styles.tagNeutral}>
                          {recommended ? 'Recommended for current mood' : 'Alternative option'}
                        </Text>
                        <ActionButton label="Add to cart" onPress={() => addToCart(item)} />
                      </View>
                    </View>
                  );
                })}
              </View>
            </Card>

            <Card>
              <SectionTitle
                title="Cart and checkout"
                caption="Orders are created instantly and assigned to a delivery partner."
              />
              {cart.length ? (
                <>
                  {cart.map((item) => (
                    <View key={item.id} style={styles.cartRow}>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemTitle}>{item.name}</Text>
                        <Text style={styles.itemMeta}>
                          {item.quantity} x {currency(item.price)}
                        </Text>
                      </View>
                      <View style={styles.stepper}>
                        <Pressable
                          onPress={() => updateQuantity(item.id, item.quantity - 1)}
                          style={styles.stepperButton}
                        >
                          <Text style={styles.stepperText}>-</Text>
                        </Pressable>
                        <Text style={styles.stepperValue}>{item.quantity}</Text>
                        <Pressable
                          onPress={() => updateQuantity(item.id, item.quantity + 1)}
                          style={styles.stepperButton}
                        >
                          <Text style={styles.stepperText}>+</Text>
                        </Pressable>
                      </View>
                    </View>
                  ))}
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total</Text>
                    <Text style={styles.summaryValue}>{currency(cartTotal)}</Text>
                  </View>
                  <ActionButton label="Place order" onPress={placeOrder} fullWidth />
                </>
              ) : (
                <Text style={styles.emptyText}>Your cart is empty. Add a recommended meal to continue.</Text>
              )}
            </Card>

            <Card>
              <SectionTitle
                title="Customer order history"
                caption="Track the latest orders created through the demo."
              />
              {customerOrders.length ? (
                customerOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))
              ) : (
                <Text style={styles.emptyText}>No orders yet for this customer profile.</Text>
              )}
            </Card>
          </>
        ) : null}

        {role === 'restaurant' ? (
          <Card>
            <SectionTitle
              title="Restaurant dashboard"
              caption="This view is configured for Green Kitchen."
            />
            <View style={styles.metricsRow}>
              <Metric label="Menu items" value={MENU.filter((item) => item.restaurantId === 'r1').length} />
              <Metric label="Active orders" value={restaurantOrders.length} />
            </View>
            <Text style={styles.subheading}>Current menu</Text>
            {MENU.filter((item) => item.restaurantId === 'r1').map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <Text style={styles.itemTitle}>{item.name}</Text>
                <Text style={styles.itemMeta}>
                  {currency(item.price)} | {item.calories} kcal
                </Text>
                <Text style={styles.itemDescription}>{item.description}</Text>
              </View>
            ))}
            <Text style={styles.subheading}>Incoming orders</Text>
            {restaurantOrders.map((order) => (
              <View key={order.id} style={styles.itemCard}>
                <OrderCard order={order} compact />
                {order.status !== 'Delivered' ? (
                  <ActionButton
                    label={
                      order.status === 'Preparing' ? 'Mark as out for delivery' : 'Mark as delivered'
                    }
                    onPress={() => advanceOrderStatus(order.id)}
                  />
                ) : null}
              </View>
            ))}
          </Card>
        ) : null}

        {role === 'delivery' ? (
          <Card>
            <SectionTitle
              title="Delivery dashboard"
              caption="This view is configured for delivery partner Arjun."
            />
            <View style={styles.metricsRow}>
              <Metric label="Assigned orders" value={deliveryOrders.length} />
              <Metric
                label="Completed"
                value={deliveryOrders.filter((order) => order.status === 'Delivered').length}
              />
            </View>
            {deliveryOrders.map((order) => (
              <View key={order.id} style={styles.itemCard}>
                <OrderCard order={order} />
                {order.status !== 'Delivered' ? (
                  <ActionButton
                    label={
                      order.status === 'Preparing' ? 'Pick up order' : 'Complete delivery'
                    }
                    onPress={() => advanceOrderStatus(order.id)}
                  />
                ) : null}
              </View>
            ))}
          </Card>
        ) : null}

        {role === 'admin' ? (
          <Card>
            <SectionTitle
              title="Admin dashboard"
              caption="Quick operational overview across the whole platform."
            />
            <View style={styles.metricsGrid}>
              <Metric label="Total orders" value={orders.length} />
              <Metric label="Delivered" value={deliveredCount} />
              <Metric label="Revenue" value={currency(revenue)} />
              <Metric label="Restaurants" value={3} />
            </View>
            <Text style={styles.subheading}>Live operations</Text>
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </Card>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ title, caption }: { title: string; caption: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionCaption}>{caption}</Text>
    </View>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#64748b"
        style={styles.input}
      />
    </View>
  );
}

function ActionButton({
  label,
  onPress,
  fullWidth,
}: {
  label: string;
  onPress: () => void;
  fullWidth?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.button, fullWidth && styles.buttonFull]}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function OrderCard({ order, compact }: { order: Order; compact?: boolean }) {
  return (
    <View style={[styles.orderCard, compact && styles.orderCardCompact]}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>{order.id}</Text>
        <Text style={styles.orderStatus}>{order.status}</Text>
      </View>
      <Text style={styles.orderMeta}>
        {order.customerName} | {order.restaurantName} | Mood: {order.mood}
      </Text>
      <Text style={styles.orderMeta}>Delivery partner: {order.deliveryPartner}</Text>
      <Text style={styles.orderMeta}>Address: {order.deliveryAddress}</Text>
      <Text style={styles.orderMeta}>
        Items: {order.items.map((item) => `${item.name} x${item.quantity}`).join(', ')}
      </Text>
      <Text style={styles.orderTotal}>Total: {currency(order.total)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  hero: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  eyebrow: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  title: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 22,
  },
  roleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#1e293b',
  },
  chipActive: {
    backgroundColor: '#22c55e',
  },
  chipText: {
    color: '#cbd5e1',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#052e16',
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 14,
  },
  sectionHeader: {
    gap: 6,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '800',
  },
  sectionCaption: {
    color: '#94a3b8',
    lineHeight: 20,
  },
  inputGrid: {
    gap: 12,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#020617',
    color: '#f8fafc',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  list: {
    gap: 12,
  },
  itemCard: {
    backgroundColor: '#020617',
    borderRadius: 18,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  itemInfo: {
    flex: 1,
    gap: 3,
  },
  itemTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
  itemMeta: {
    color: '#94a3b8',
    lineHeight: 18,
  },
  itemDescription: {
    color: '#cbd5e1',
    lineHeight: 20,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  price: {
    color: '#facc15',
    fontSize: 16,
    fontWeight: '800',
  },
  tagRecommended: {
    color: '#86efac',
    fontWeight: '700',
  },
  tagNeutral: {
    color: '#cbd5e1',
    fontWeight: '700',
  },
  button: {
    backgroundColor: '#38bdf8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 11,
    alignItems: 'center',
  },
  buttonFull: {
    width: '100%',
  },
  buttonText: {
    color: '#082f49',
    fontWeight: '800',
  },
  cartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#020617',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
  },
  stepperValue: {
    color: '#f8fafc',
    minWidth: 18,
    textAlign: 'center',
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#cbd5e1',
    fontSize: 16,
    fontWeight: '700',
  },
  summaryValue: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '800',
  },
  emptyText: {
    color: '#94a3b8',
    lineHeight: 20,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    minWidth: 140,
    backgroundColor: '#020617',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 4,
  },
  metricValue: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '800',
  },
  metricLabel: {
    color: '#94a3b8',
    fontWeight: '600',
  },
  subheading: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '800',
  },
  orderCard: {
    backgroundColor: '#020617',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 6,
  },
  orderCardCompact: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  orderId: {
    color: '#f8fafc',
    fontWeight: '800',
  },
  orderStatus: {
    color: '#38bdf8',
    fontWeight: '800',
  },
  orderMeta: {
    color: '#cbd5e1',
    lineHeight: 19,
  },
  orderTotal: {
    color: '#facc15',
    fontWeight: '800',
    marginTop: 4,
  },
});

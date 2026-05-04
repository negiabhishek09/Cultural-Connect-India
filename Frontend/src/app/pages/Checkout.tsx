import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, MapPin, CreditCard, CheckCircle, ArrowLeft, Plus } from 'lucide-react';
import { ModernNavbar } from '../components/ModernNavbar';
import { Footer } from '../components/Footer';
import { useApp } from '../context/AppContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { AddressModal } from '../components/modals/AddressModal';
import type { Address } from '../context/AppContext';
import { toast } from 'sonner';

export function Checkout() {
  const navigate = useNavigate();
  const { cart, addresses, clearCart, addNotification } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });
  const [upiId, setUpiId] = useState('');
  const [placedOrder, setPlacedOrder] = useState<{ id: string; total: number } | null>(null);

  const total = cart.reduce((sum, item) => {
    const price = typeof item.price === 'string'
      ? parseInt(item.price.replace(/[^0-9]/g, ''))
      : item.price;
    return sum + price * item.quantity;
  }, 0);

  const steps = [
    { id: 1, name: 'Cart Review', icon: ShoppingBag },
    { id: 2, name: 'Address', icon: MapPin },
    { id: 3, name: 'Payment', icon: CreditCard },
    { id: 4, name: 'Confirmation', icon: CheckCircle },
  ];

  // ✅ Address select handler — debug ke saath
  const handleSelectAddress = (address: Address) => {
    console.log('Address selected:', address);
    setSelectedAddress(address);
  };

  // ✅ Step 2 → Step 3 navigate
  const handleContinueToPayment = () => {
    console.log('selectedAddress at continue:', selectedAddress);
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }
    setCurrentStep(3);
  };

  const handlePlaceOrder = async () => {
    console.log('handlePlaceOrder called');
    console.log('selectedAddress:', selectedAddress);
    console.log('paymentMethod:', paymentMethod);

    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }
    if (paymentMethod === 'card' && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv)) {
      toast.error('Please enter valid card details');
      return;
    }
    if (paymentMethod === 'upi' && !upiId) {
      toast.error('Please enter UPI ID');
      return;
    }

    setIsProcessing(true);

    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/orders`,  {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          address: `${selectedAddress.addressLine}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}`,
          phone: selectedAddress.phone,
          paymentMethod,
          notes: '',
        }),
      });

      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);

      if (!res.ok) {
        toast.error(data.message || 'Order failed. Try again.');
        return;
      }

      setPlacedOrder({ id: data.data._id, total: data.data.totalAmount });
      clearCart();
      addNotification();
      setCurrentStep(4);
      toast.success('Order placed! Confirmation email sent 📧');

    } catch (err) {
      console.error('Order error:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0 && currentStep !== 4) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ModernNavbar />
        <div className="pt-28 pb-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some products to continue shopping</p>
            <motion.button
              onClick={() => navigate('/marketplace')}
              className="px-6 py-3 bg-orange-600 text-white rounded-full font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Browse Products
            </motion.button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernNavbar />

      <div className="pt-28 pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          <motion.button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-orange-600"
            whileHover={{ x: -5 }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </motion.button>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center flex-1">
                    <motion.div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${currentStep >= step.id ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-500'
                        }`}
                      animate={{ scale: currentStep === step.id ? 1.1 : 1 }}
                    >
                      <step.icon className="w-6 h-6" />
                    </motion.div>
                    <span className="text-sm mt-2 font-medium text-gray-700">{step.name}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-1 flex-1 ${currentStep > step.id ? 'bg-orange-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">

            {/* Step 1: Cart Review */}
            {currentStep === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="bg-white rounded-3xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Cart</h2>
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-2xl">
                        <div className="w-20 h-20 rounded-xl overflow-hidden">
                          <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-500">{item.category}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="font-bold text-orange-600">{item.price}</span>
                            <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-2xl font-bold text-orange-600">₹{total.toLocaleString()}</span>
                    </div>
                    <motion.button
                      onClick={() => setCurrentStep(2)}
                      className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-bold"
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    >
                      Continue to Address
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Address */}
            {currentStep === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="bg-white rounded-3xl shadow-lg p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Delivery Address</h2>
                    <motion.button
                      onClick={() => setShowAddressModal(true)}
                      className="px-4 py-2 bg-orange-600 text-white rounded-full flex items-center gap-2"
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    >
                      <Plus className="w-4 h-4" /> Add New
                    </motion.button>
                  </div>

                  {addresses.length === 0 ? (
                    <div className="text-center py-12">
                      <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">No saved addresses</p>
                      <motion.button
                        onClick={() => setShowAddressModal(true)}
                        className="px-6 py-3 bg-orange-600 text-white rounded-full font-semibold"
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      >
                        Add Address
                      </motion.button>
                    </div>
                  ) : (
                    <div className="space-y-4 mb-6">
                      {addresses.map((address) => (
                        <motion.div
                          key={address.id}
                          onClick={() => handleSelectAddress(address)} // ✅ fixed
                          className={`p-4 border-2 rounded-2xl cursor-pointer transition-all ${selectedAddress?.id === address.id
                              ? 'border-orange-600 bg-orange-50'
                              : 'border-gray-200 hover:border-orange-300'
                            }`}
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-bold text-gray-900">{address.fullName}</h3>
                              <p className="text-sm text-gray-600 mt-1">{address.phone}</p>
                              <p className="text-sm text-gray-600 mt-2">{address.addressLine}, {address.city}</p>
                              <p className="text-sm text-gray-600">{address.state} - {address.pincode}</p>
                            </div>
                            {address.isDefault && (
                              <span className="px-3 py-1 bg-orange-600 text-white text-xs rounded-full">Default</span>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <motion.button
                      onClick={() => setCurrentStep(1)}
                      className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold"
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    >
                      Back
                    </motion.button>
                    <motion.button
                      onClick={handleContinueToPayment} // ✅ fixed
                      className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-bold"
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    >
                      Continue to Payment
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="bg-white rounded-3xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Method</h2>

                  <div className="space-y-4 mb-6">
                    {/* COD */}
                    <motion.div onClick={() => setPaymentMethod('cod')} className={`p-4 border-2 rounded-2xl cursor-pointer ${paymentMethod === 'cod' ? 'border-orange-600 bg-orange-50' : 'border-gray-200'}`} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-orange-600' : 'border-gray-300'}`}>
                          {paymentMethod === 'cod' && <div className="w-3 h-3 bg-orange-600 rounded-full" />}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">Cash on Delivery</h3>
                          <p className="text-sm text-gray-600">Pay when you receive</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* UPI */}
                    <motion.div onClick={() => setPaymentMethod('upi')} className={`p-4 border-2 rounded-2xl cursor-pointer ${paymentMethod === 'upi' ? 'border-orange-600 bg-orange-50' : 'border-gray-200'}`} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'upi' ? 'border-orange-600' : 'border-gray-300'}`}>
                          {paymentMethod === 'upi' && <div className="w-3 h-3 bg-orange-600 rounded-full" />}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">UPI</h3>
                          <p className="text-sm text-gray-600">Pay via UPI ID</p>
                        </div>
                      </div>
                      {paymentMethod === 'upi' && (
                        <input type="text" placeholder="Enter UPI ID (e.g., username@upi)" value={upiId} onChange={(e) => setUpiId(e.target.value)} className="w-full mt-3 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none" />
                      )}
                    </motion.div>

                    {/* Card */}
                    <motion.div onClick={() => setPaymentMethod('card')} className={`p-4 border-2 rounded-2xl cursor-pointer ${paymentMethod === 'card' ? 'border-orange-600 bg-orange-50' : 'border-gray-200'}`} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? 'border-orange-600' : 'border-gray-300'}`}>
                          {paymentMethod === 'card' && <div className="w-3 h-3 bg-orange-600 rounded-full" />}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">Credit/Debit Card</h3>
                          <p className="text-sm text-gray-600">Visa, Mastercard, RuPay</p>
                        </div>
                      </div>
                      {paymentMethod === 'card' && (
                        <div className="mt-3 space-y-3">
                          <input type="text" placeholder="Card Number" value={cardDetails.number} onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })} className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none" maxLength={16} />
                          <div className="grid grid-cols-2 gap-3">
                            <input type="text" placeholder="MM/YY" value={cardDetails.expiry} onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })} className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none" maxLength={5} />
                            <input type="text" placeholder="CVV" value={cardDetails.cvv} onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })} className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none" maxLength={3} />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </div>

                  <div className="border-t pt-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total Amount</span>
                      <span className="text-2xl font-bold text-orange-600">₹{total.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <motion.button onClick={() => setCurrentStep(2)} className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>Back</motion.button>
                    <motion.button
                      onClick={handlePlaceOrder}
                      disabled={isProcessing}
                      className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-bold disabled:opacity-50"
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    >
                      {isProcessing ? 'Processing...' : 'Place Order'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Confirmation */}
            {currentStep === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
                    <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed! 🎊</h2>
                  <p className="text-gray-600 mb-2">Thank you for your order!</p>
                  <p className="text-sm text-orange-600 font-medium mb-6">📧 Confirmation email sent to your inbox</p>

                  <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                    <p className="font-semibold text-gray-900 mb-4">Order Status</p>
                    <div className="flex items-center justify-between">
                      {[
                        { label: 'Confirmed', emoji: '✅', done: true },
                        { label: 'Packed', emoji: '📦', done: false },
                        { label: 'Shipped', emoji: '🚚', done: false },
                        { label: 'Delivered', emoji: '🏠', done: false },
                      ].map((s) => (
                        <div key={s.label} className="flex-1 flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mb-2 ${s.done ? 'bg-green-100' : 'bg-gray-100'}`}>
                            {s.emoji}
                          </div>
                          <p className={`text-xs font-medium ${s.done ? 'text-green-600' : 'text-gray-400'}`}>{s.label}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-4">You'll receive an email at every status update 📬</p>
                  </div>

                  <div className="bg-orange-50 rounded-2xl p-6 mb-6 text-left">
                    <div className="grid grid-cols-2 gap-4">
                      {placedOrder && (
                        <>
                          <div>
                            <p className="text-sm text-gray-600">Order ID</p>
                            <p className="font-bold text-gray-900">#{placedOrder.id.slice(-8).toUpperCase()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Amount</p>
                            <p className="font-bold text-orange-600">₹{placedOrder.total.toLocaleString()}</p>
                          </div>
                        </>
                      )}
                      <div className="col-span-2">
                        <p className="text-sm text-gray-600 mb-1">Delivery Address</p>
                        <p className="font-medium text-gray-900">{selectedAddress?.fullName}</p>
                        <p className="text-sm text-gray-600">{selectedAddress?.addressLine}, {selectedAddress?.city}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <motion.button onClick={() => navigate('/profile')} className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>View Orders</motion.button>
                    <motion.button onClick={() => navigate('/marketplace')} className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-bold" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>Continue Shopping</motion.button>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      <Footer />
      <AddressModal isOpen={showAddressModal} onClose={() => setShowAddressModal(false)} />
    </div>
  );
}
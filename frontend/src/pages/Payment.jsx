import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSmartphone, FiMonitor, FiUploadCloud, FiClock, FiCheckCircle, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const orderId = searchParams.get('orderId');

  const [qrData, setQrData] = useState(null);
  const [loadingQr, setLoadingQr] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [proofUploaded, setProofUploaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch QR code
  useEffect(() => {
    if (!orderId) {
      toast.error('Order ID is missing.');
      navigate('/');
      return;
    }

    const fetchQR = async () => {
      try {
        const res = await axiosInstance.get('/payment/qr');
        if (res.data.success) {
          setQrData(res.data);
        }
      } catch (err) {
        toast.error('Failed to load UPI QR code.');
      } finally {
        setLoadingQr(false);
      }
    };

    fetchQR();
  }, [orderId, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file (PNG, JPG, JPEG, WEBP).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size cannot exceed 5MB.');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a payment proof screenshot.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('orderId', orderId);
    formData.append('paymentProof', selectedFile);

    try {
      const res = await axiosInstance.post('/payment/upload-proof', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        toast.success('Payment proof uploaded successfully!');
        setProofUploaded(true);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to upload payment proof.');
    } finally {
      setUploading(false);
    }
  };

  if (loadingQr) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-neutral font-light">Generating Secure UPI QR Code...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-primary/5 pb-6">
        <h1 className="font-serif text-3xl font-bold tracking-wide">Complete Payment</h1>
        <p className="text-sm text-neutral font-light mt-1">Scan or pay directly via UPI to confirm order placement.</p>
      </div>

      <AnimatePresence mode="wait">
        {!proofUploaded ? (
          <motion.div
            key="payment-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start"
          >
            {/* Desktop: QR display */}
            <div className="md:col-span-6 bg-white border border-primary/5 rounded-3xl p-6 shadow-premium text-center flex flex-col items-center gap-4">
              <h3 className="font-serif text-lg font-bold text-primary">Scan QR to Pay</h3>
              
              {/* QR Image */}
              <div className="w-48 h-48 border border-primary/10 rounded-2xl overflow-hidden p-2 bg-background flex items-center justify-center shadow-premium">
                <img
                  src={qrData?.qrCodeImage}
                  alt="UPI QR Code"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-1.5 text-xs text-text/80 font-light">
                <p>
                  Payee: <strong className="font-semibold text-primary">{qrData?.upiName}</strong>
                </p>
                <p>
                  UPI ID: <strong className="font-semibold text-primary">{qrData?.upiId}</strong>
                </p>
              </div>

              {/* Informative notice */}
              <div className="flex gap-2.5 p-3.5 bg-background/50 border border-primary/5 rounded-2xl text-[10px] text-neutral text-left font-light leading-relaxed">
                <FiInfo className="text-primary text-base flex-shrink-0 mt-0.5" />
                <p>
                  Scan this QR code using any UPI enabled app (GPay, PhonePe, Paytm, BHIM, etc.) on your mobile device.
                </p>
              </div>
            </div>

            {/* Mobile / Link payment & Upload proof */}
            <div className="md:col-span-6 space-y-6">
              {/* UPI App Link */}
              <div className="bg-white border border-primary/5 rounded-3xl p-6 shadow-premium space-y-4">
                <h3 className="font-serif text-lg font-bold text-primary flex items-center gap-2">
                  <FiSmartphone className="text-xl text-primary" /> Pay via App
                </h3>
                
                {isMobile ? (
                  <div className="space-y-3">
                    <p className="text-xs text-neutral font-light">
                      Click the button below to launch your default UPI app directly.
                    </p>
                    <a
                      href={qrData?.upiString}
                      className="w-full py-3 bg-primary text-white text-xs font-bold tracking-widest uppercase rounded-xl hover:bg-primary/95 transition-all shadow-premium flex items-center justify-center gap-2"
                    >
                      Pay Using UPI App
                    </a>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2.5 items-start p-3 bg-red-50 border border-red-100 rounded-2xl text-[10px] text-red-500 font-light">
                      <FiSmartphone className="text-sm mt-0.5 flex-shrink-0" />
                      <p>UPI App direct payment works only on mobile devices.</p>
                    </div>
                    <button
                      disabled
                      className="w-full py-3 bg-neutral-grey/20 text-neutral text-xs font-bold tracking-widest uppercase rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      Pay Using UPI App (Disabled)
                    </button>
                  </div>
                )}
              </div>

              {/* Upload screenshot form */}
              <div className="bg-white border border-primary/5 rounded-3xl p-6 shadow-premium">
                <h3 className="font-serif text-lg font-bold text-primary mb-4">Upload Proof</h3>
                
                <form onSubmit={handleSubmitProof} className="space-y-4">
                  {/* File Dropzone */}
                  <div className="relative border-2 border-dashed border-primary/15 hover:border-primary/40 rounded-2xl p-6 transition-all bg-background/30 flex flex-col items-center justify-center text-center gap-2 min-h-[140px] cursor-pointer group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    
                    {previewUrl ? (
                      <div className="relative w-20 h-28 border border-primary/10 rounded overflow-hidden shadow-premium">
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <>
                        <FiUploadCloud className="text-3xl text-primary/60 group-hover:text-primary transition-colors" />
                        <span className="text-xs font-semibold text-primary">Upload Screenshot</span>
                        <span className="text-[10px] text-neutral font-light">PNG, JPG, JPEG up to 5MB</span>
                      </>
                    )}
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={uploading || !selectedFile}
                    className="w-full py-3 bg-primary text-white text-xs font-bold tracking-widest uppercase rounded-xl hover:bg-primary/95 transition-all shadow-premium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {uploading ? 'Uploading Proof...' : 'Submit Transaction Proof'}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Waiting for Admin Approval state */
          <motion.div
            key="success-approval"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto bg-white border border-primary/5 rounded-3xl p-8 md:p-10 shadow-premium text-center space-y-6"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto animate-pulse">
              <FiClock className="text-3xl" />
            </div>
            
            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-bold text-primary">Awaiting Approval</h2>
              <p className="text-sm text-neutral font-light leading-relaxed">
                Your payment proof was uploaded successfully. Atelier administrators are currently reviewing your transaction.
              </p>
            </div>

            <div className="flex gap-2.5 p-3.5 bg-background border border-primary/5 rounded-2xl text-[10px] text-neutral text-left font-light leading-relaxed">
              <FiCheckCircle className="text-green-600 text-sm mt-0.5 flex-shrink-0" />
              <p>
                Verification usually takes between 10 to 30 minutes. You will be able to track status changes directly in your dashboard.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => navigate(`/orders/track/${orderId}`)}
                className="w-full py-3 bg-primary text-white text-xs font-bold tracking-widest uppercase rounded-xl hover:bg-primary/95 transition-all shadow-premium"
              >
                Track Order Status
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full py-3 border border-primary/15 rounded-xl text-xs font-bold uppercase tracking-wider text-text/85 hover:bg-background transition-all"
              >
                Return to Homepage
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Payment;

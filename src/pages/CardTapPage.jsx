import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  Watch,
  ShieldCheck,
  Sparkles,
  UserCheck,
  User,
  Mail,
  AtSign,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { Toast } from '../components/Common/Toast';

export const CardTapPage = () => {
  const { cardUid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Extract signature from query params ?sig=a9f4c3b2
  const queryParams = new URLSearchParams(location.search);
  const signature = queryParams.get('sig');

  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [cardData, setCardData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Claim Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (cardUid) {
      loadCardInfo();
    }
  }, [cardUid, signature]);

  const loadCardInfo = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.getCardDetails(cardUid, signature);
      if (res && res.success && res.data) {
        const card = res.data;
        setCardData(card);

        // If card is already claimed, automatically redirect to public profile page
        if (card.status === 'claimed' || card.status === 'active' || card.linkedUser) {
          const owner = card.linkedUser || card.ownerUsername || 'member';
          setTimeout(() => {
            navigate(`/profile/${owner}`, { replace: true });
          }, 1200);
        }
      } else {
        setErrorMsg(`Hardware tag '${cardUid}' could not be verified.`);
      }
    } catch (err) {
      setErrorMsg(err.message || `Invalid signature or unregistered NFC tag '${cardUid}'.`);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimCard = async (e) => {
    e.preventDefault();
    if (!username.trim() || !email.trim()) {
      setToastMessage({ message: 'Please fill in your email and desired username', type: 'error' });
      return;
    }

    setClaiming(true);
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

    try {
      const res = await api.claimCard({
        cardUid: cardData.cardUid,
        signature: cardData.signature || signature,
        username: cleanUsername,
        email: email.trim(),
        name: name.trim() || 'Bloom Member',
      });

      if (res && res.success) {
        setToastMessage({
          message: `Hardware ${cardData.hardwareType} claimed & linked to @${cleanUsername}!`,
          type: 'success',
        });
        
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#0088CC', '#00BCFF', '#10B981', '#7C3AED'],
        });

        setTimeout(() => {
          navigate(`/profile/${cleanUsername}`);
        }, 1500);
      }
    } catch (err) {
      setToastMessage({ message: err.message || 'Failed to claim hardware tag', type: 'error' });
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1329] text-white flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-[#0088CC] animate-pulse">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>
          <p className="text-slate-400 font-mono text-xs tracking-widest uppercase">
            Verifying Cryptographic Hardware Tag...
          </p>
        </div>
      </div>
    );
  }

  // Error State: Invalid Signature / Tag Not Found
  if (errorMsg || !cardData) {
    return (
      <div className="min-h-screen bg-[#0b1329] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900/80 border border-rose-500/30 rounded-3xl p-8 backdrop-blur-xl text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Invalid Hardware Tag</h2>
            <p className="text-slate-400 text-xs mt-2 font-mono leading-relaxed">
              {errorMsg || 'The cryptographic signature for this NFC hardware could not be verified against the Bloom registry.'}
            </p>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-400">
            UID: <span className="text-rose-400">{cardUid}</span> | Sig: <span className="text-rose-400">{signature || 'None'}</span>
          </div>
          <div className="pt-2">
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all border border-slate-700"
            >
              Return to Admin Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // State B: CLAIMED Hardware -> Redirecting notice
  if (cardData.status === 'claimed' || cardData.status === 'active' || cardData.linkedUser) {
    const owner = cardData.linkedUser || cardData.ownerUsername || 'member';
    return (
      <div className="min-h-screen bg-[#0b1329] text-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900/80 border border-emerald-500/30 rounded-3xl p-8 backdrop-blur-xl text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-bounce">
            <UserCheck className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Active Hardware Tag
            </span>
            <h2 className="text-2xl font-extrabold text-white mt-3">Connecting to Profile...</h2>
            <p className="text-slate-400 text-xs mt-1 font-mono">
              Tag linked to <strong className="text-cyan-400">@{owner}</strong>
            </p>
          </div>
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>Hardware: {cardData.cardUid}</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Verified
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Redirecting to profile page now...</p>
        </div>
      </div>
    );
  }

  // State A: UNCLAIMED Hardware -> Sleek Luxe Claiming Screen
  const isWristband = cardData.hardwareType === 'Wristband';

  return (
    <div className="min-h-screen bg-[#080d1a] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <Toast
        message={toastMessage?.message}
        type={toastMessage?.type}
        onClose={() => setToastMessage(null)}
      />

      <div className="w-full max-w-lg relative z-10">
        {/* Main Glassmorphism Card Container */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl space-y-6">
          
          {/* Card Header & Hardware Badges */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[#00BCFF] text-xs font-mono">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              BLOOM NFC HARDWARE TAP
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome to your new <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                Bloom {isWristband ? 'Wristband' : 'Card'}
              </span>
            </h1>
            
            <p className="text-slate-400 text-xs sm:text-sm max-w-sm mx-auto">
              Claim this physical hardware tag to link it with your digital profile and share your contact details instantly upon tap.
            </p>
          </div>

          {/* Hardware Identity Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isWristband ? 'bg-purple-500/10 border border-purple-500/30 text-purple-400' : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400'
                }`}>
                  {isWristband ? <Watch className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-white uppercase tracking-wider">{cardData.finishName || `Bloom NFC ${cardData.hardwareType}`}</p>
                  <p className="text-[11px] font-mono text-cyan-400">{cardData.cardUid}</p>
                </div>
              </div>

              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold uppercase">
                Unclaimed
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" /> RSA Signature Verified
              </span>
              <span className="text-slate-500">Sig: {cardData.signature || signature || 'a9f4c3b2'}</span>
            </div>
          </div>

          {/* Claim Form */}
          <form onSubmit={handleClaimCard} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-cyan-500 placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="alex@bloom.ng"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-cyan-500 placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                Desired Profile Handle (@username)
              </label>
              <div className="relative">
                <AtSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="alexmorgan"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-cyan-500 placeholder:text-slate-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={claiming}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#0088CC] to-[#00BCFF] hover:opacity-95 text-white font-extrabold text-sm sm:text-base transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-2"
            >
              {claiming ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Linking {cardData.hardwareType} Tag...
                </>
              ) : (
                <>
                  <UserCheck className="w-5 h-5" />
                  Claim & Link to My Profile
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Footer Branding */}
          <div className="pt-2 text-center text-xs text-slate-500 font-mono flex items-center justify-center gap-2">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Encrypted Bloom NFC Infrastructure</span>
          </div>
        </div>
      </div>
    </div>
  );
};

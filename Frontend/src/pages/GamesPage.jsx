import React, { useState, useEffect } from 'react';
import { ChevronLeft, Gift, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import toast from '../utils/toast';
import analytics from '../utils/analytics';

// Import Games Overlays
import SnakeGame from '../components/games/SnakeGame';
import SpeedTapGame from '../components/games/SpeedTap/SpeedTapGame';
import TicTacToeGame from '../components/games/TicTacToe/TicTacToeGame';
import QuizGame from '../components/games/QuizGame/QuizGame';

// Import Icons
import speedTapImg from '../assets/GamesIcons/speed_tap.webp';
import snakeImg from '../assets/GamesIcons/snake.webp';
import ticTacToeImg from '../assets/GamesIcons/tic_tac_toe.webp';
import quizImg from '../assets/GamesIcons/quiz.webp';
import categoryForUImg from '../assets/CategorySection/categoryForU-removebg-preview.webp';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const GAME_ASSETS = {
  speedTap: { title: 'Speed Tap', icon: speedTapImg },
  snake: { title: 'Snake & Chase', icon: snakeImg },
  ticTacToe: { title: 'Tic Tac Toe', icon: ticTacToeImg },
  quiz: { title: 'Quiz Game', icon: quizImg }
};

export default function GamesPage() {
  const navigate = useNavigate();
  const { coins, addCoins, user } = useApp();
  
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeGame, setActiveGame] = useState(null); // 'quiz' | 'speedTap' | 'ticTacToe' | 'snake' | null
  const [selectedGameKey, setSelectedGameKey] = useState('speedTap');

  const fetchGames = async () => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/games`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setGames(data.data);
      }
    } catch (err) {
      console.error('Failed to load games list', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, [user]);

  const handleOpenGame = (gameKey) => {
    analytics.trackGamePlay(gameKey, 'start');
    setActiveGame(gameKey);
  };

  const handleRecordPlay = async (gameKey, scoreAmount) => {
    analytics.trackGamePlay(gameKey, 'complete', scoreAmount);
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        // Fallback for guest play
        if (scoreAmount > 0) {
          addCoins(scoreAmount);
          toast.success(`You won ${scoreAmount} Coins! Log in to save streak progress.`);
        }
        return;
      }
      const res = await fetch(`${API_BASE}/games/play`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ gameKey })
      });
      const data = await res.json();
      if (data.success) {
        if (data.pointsAwarded > 0) {
          toast.success(`🎉 Streak Completed! You won ${data.pointsAwarded} Coins!`, { duration: 5000 });
          addCoins(data.pointsAwarded);
        } else if (data.cycleCompleted) {
          toast.success('Streak Cycle Completed! Rules limits met.');
        } else {
          toast.success(`Game play recorded! Daily target: ${data.playCountToday} plays today.`);
        }
        fetchGames();
      } else {
        toast.error(data.message || 'Game limit reached or not counted.');
      }
    } catch (err) {
      console.error('Failed to record game play', err);
      // Fail-safe fallback if API is offline
      if (scoreAmount > 0) {
        addCoins(scoreAmount);
      }
    }
  };

  const handleInvite = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Join Mynzo',
          text: 'Come play games and win rewards on Mynzo!',
          url: window.location.origin
        });
      }
    } catch (err) {
      console.log('Error sharing:', err);
    }
  };

  // Find currently selected game data
  const selectedGameData = games.find(g => g.key === selectedGameKey) || games[0];
  const totalStreakDays = selectedGameData?.userProgress?.currentStreakDays || 0;
  const maxConfiguredDays = selectedGameData?.requiredDays || 3;
  const streakRange = Array.from({ length: maxConfiguredDays }, (_, i) => i + 1);

  return (
    <div className="flex flex-col h-screen bg-[#FFF6F2] relative font-sans">
      
      <div className="flex-grow overflow-y-auto pb-24 bg-[#FFF6F2]">
        {/* Playground Header */}
        <div className="sticky top-0 bg-orange-100 border-b-2 border-[#EE4923]/20 backdrop-blur-md z-20 shadow-sm">
          <div className="flex items-center justify-between px-5 py-2.5 md:max-w-3xl md:mx-auto">
            <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full hover:bg-black/5 transition-colors">
              <ChevronLeft className="w-6 h-6 text-[#071226]" />
            </button>
            <div className="flex flex-col items-center">
              <h1 className="text-xl font-black text-[#071226] uppercase tracking-tighter leading-none">PLAYGROUND <span className="text-amber-400">✦</span></h1>
              <p className="text-[10px] font-medium text-slate-600 mt-0.5">Play Games, Win Rewards!</p>
            </div>
            <div className="w-6 h-6"></div>
          </div>
        </div>

        <div className="px-5 mt-2 space-y-6 md:max-w-3xl md:mx-auto">

          {/* Wallet Card */}
          <div className="relative w-full h-44 rounded-2xl p-5 text-white overflow-hidden shadow-lg"
               style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #EE4923 100%)' }}>
            <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-white/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 flex flex-col h-full justify-between w-1/2">
              <div>
                <p className="text-sm font-bold opacity-90">My Coins</p>
                <p className="text-[10px] uppercase tracking-widest opacity-80 mb-1">Balance</p>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center border-2 border-white/30 shadow-inner">
                    <span className="text-[10px] font-black text-amber-900">M</span>
                  </div>
                  <span className="text-3xl font-black">{coins}</span>
                </div>
              </div>
              <button onClick={() => navigate('/wallet')} className="bg-white text-[#EE4923] text-[10px] font-black px-4 py-1.5 rounded-full w-max shadow-md flex items-center gap-1 active:scale-95 transition-transform">
                My Wallet <ChevronLeft className="w-3 h-3 rotate-180" />
              </button>
            </div>

            <div className="absolute bottom-[-10px] right-[-20px] w-48 h-48 z-10 pointer-events-none">
              <img src={categoryForUImg} alt="Gift Box" className="w-full h-full object-contain drop-shadow-2xl" />
            </div>
          </div>

          {/* Fun Zone Section */}
          {/* Top Games Section */}
          <div>
            <h2 className="text-xl font-black text-[#071226] mb-4">Top Games</h2>

            <div className="grid grid-cols-4 gap-3">
              {[
                { id: 'speedTap', key: 'speedTap' },
                { id: 'snake', key: 'snake' },
                { id: 'ticTacToe', key: 'ticTacToe' },
                { id: 'quiz', key: 'quiz' }
              ].map(gRef => {
                const details = GAME_ASSETS[gRef.id];
                const isSelected = selectedGameKey === gRef.key;
                return (
                  <div 
                    key={gRef.id} 
                    onClick={() => setSelectedGameKey(gRef.key)} 
                    className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform font-bold"
                  >
                    <div className={`w-16 h-16 rounded-2xl bg-white shadow-sm p-1 overflow-hidden flex items-center justify-center border-2 transition-all ${
                      isSelected ? 'border-[#EE4923] ring-4 ring-orange-100 scale-105' : 'border-slate-100 hover:border-slate-300'
                    }`}>
                      <img src={details.icon} alt={details.title} className="w-full h-full object-cover rounded-xl" />
                    </div>
                    <span className={`text-[9px] text-center leading-tight transition-colors ${
                      isSelected ? 'text-[#EE4923] font-black' : 'text-slate-600'
                    }`}>{details.title}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Daily Streak */}
          <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-black text-[#071226] text-sm flex items-center gap-1">
                  🔥 {selectedGameData?.name || 'Daily'} Streak
                </h3>
                {selectedGameData && (
                  <p className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded mt-1 w-max">
                    Target Today: {selectedGameData?.userProgress?.todayPlayCount || 0} / {selectedGameData?.requiredPlaysPerDay} plays
                  </p>
                )}
              </div>
              <span className="text-[#EE4923] font-black text-xs bg-orange-50 px-3 py-1 rounded-full">{totalStreakDays} Days</span>
            </div>
            
            <p className="text-[10px] text-slate-500 font-medium">
              Play {selectedGameData?.requiredPlaysPerDay} games daily for {maxConfiguredDays} days to win <span className="font-bold text-[#EE4923]">{selectedGameData?.rewardPoints} Coins</span>!
            </p>
            
            <div className="flex justify-between relative py-2">
              <div className="absolute top-5 left-0 w-full h-[2px] bg-slate-100 z-0"></div>
              <div 
                className="absolute top-5 left-0 h-[2px] bg-[#EE4923] z-0 transition-all duration-500" 
                style={{ width: `${Math.min((totalStreakDays / maxConfiguredDays) * 100, 100)}%` }}
              ></div>
              
              {streakRange.map((day) => {
                const isPast = day <= totalStreakDays;
                const isGift = day === Math.floor(maxConfiguredDays / 2) || day === maxConfiguredDays;
                return (
                  <div key={day} className="flex flex-col items-center gap-1.5 relative z-10 bg-white px-0.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                      isPast 
                        ? 'bg-[#EE4923] text-white font-bold' 
                        : isGift 
                          ? 'bg-amber-100 text-amber-500' 
                          : 'bg-slate-100 text-transparent'
                    }`}>
                      {isPast ? '✓' : isGift ? <Gift className="w-3 h-3" /> : ''}
                    </div>
                    <span className="text-[8px] font-medium text-slate-500">Day {day}</span>
                  </div>
                );
              })}
            </div>

            <button 
              onClick={() => handleOpenGame(selectedGameKey)}
              className="w-full bg-[#071226] text-white text-xs font-black py-3 rounded-xl shadow-md active:scale-95 transition-all uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-slate-800"
            >
              Play {selectedGameData?.name || 'Game'} Now
            </button>
          </div>

          {/* Invite Banner */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl py-6 px-4 flex items-center justify-between border border-orange-200 shadow-sm mb-6 relative overflow-hidden">
            <div className="absolute left-[-10px] top-[-10px] w-28 h-28 opacity-30 pointer-events-none">
               <img src={categoryForUImg} alt="Gift" className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center gap-3 relative z-10 ml-6">
              <div>
                <h4 className="font-black text-[#071226] text-[15px]">Invite Friends</h4>
                <p className="text-xs text-[#EE4923] font-bold mt-0.5">&amp; Earn 100 Coins</p>
              </div>
            </div>
            <button onClick={handleInvite} className="bg-[#EE4923] text-white text-xs font-black px-5 py-2.5 rounded-full shadow-md active:scale-95 transition-transform z-10 relative">
              Invite Now
            </button>
          </div>

        </div>
      </div>

      {/* Dedicated Full Screen Game Overlays */}
      {activeGame === 'snake' && (
        <SnakeGame 
          onClose={() => { setActiveGame(null); fetchGames(); }} 
          addCoins={(amount) => handleRecordPlay('snake', amount)} 
        />
      )}
      {activeGame === 'speedTap' && (
        <SpeedTapGame 
          onClose={() => { setActiveGame(null); fetchGames(); }} 
          addCoins={(amount) => handleRecordPlay('speedTap', amount)} 
        />
      )}
      {activeGame === 'ticTacToe' && (
        <TicTacToeGame 
          onClose={() => { setActiveGame(null); fetchGames(); }} 
          addCoins={(amount) => handleRecordPlay('ticTacToe', amount)} 
        />
      )}
      {activeGame === 'quiz' && (
        <QuizGame 
          onClose={() => { setActiveGame(null); fetchGames(); }} 
          addCoins={(amount) => handleRecordPlay('quiz', amount)} 
        />
      )}

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  User, 
  Baby, 
  Smartphone, 
  Plus, 
  Trash2, 
  ChevronRight, 
  LogOut, 
  Activity, 
  Settings, 
  Lock,
  ArrowLeft,
  QrCode,
  CheckCircle2,
  Monitor,
  Tablet,
  Laptop
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './utils';

// --- Types ---

type View = 'selection' | 'parent-auth' | 'parent-dashboard' | 'child-auth' | 'child-home' | 'child-detail';

interface Device {
  id: string;
  name: string;
  type: 'mobile' | 'tablet' | 'laptop';
}

interface Child {
  id: string;
  name: string;
  devices: Device[];
  isActive: boolean;
  token: string;
  settings: {
    mediaFiltering: boolean;
    linkProtection: boolean;
    socialFiltering: boolean;
    screenTime: boolean;
  };
}

interface LogEntry {
  id: string;
  event: string;
  timestamp: string;
  type: 'safe' | 'blocked' | 'warning';
}

// --- Mock Data ---

const INITIAL_CHILDREN: Child[] = [
  {
    id: '1',
    name: 'Leo',
    devices: [
      { id: 'd1', name: 'iPhone 16 Pro', type: 'mobile' },
      { id: 'd2', name: 'iPad Air', type: 'tablet' }
    ],
    isActive: true,
    token: '1234',
    settings: {
      mediaFiltering: true,
      linkProtection: true,
      socialFiltering: true,
      screenTime: false
    }
  },
  {
    id: '2',
    name: 'Mia',
    devices: [
      { id: 'd3', name: 'MacBook Pro', type: 'laptop' }
    ],
    isActive: false,
    token: '5678',
    settings: {
      mediaFiltering: true,
      linkProtection: true,
      socialFiltering: true,
      screenTime: false
    }
  }
];

const MOCK_LOGS: Record<string, LogEntry[]> = {
  '1': [
    { id: 'l1', event: 'Educational site accessed', timestamp: '2 mins ago', type: 'safe' },
    { id: 'l2', event: 'Social media block triggered', timestamp: '15 mins ago', type: 'blocked' },
    { id: 'l3', event: 'Extended screen time request', timestamp: '1 hour ago', type: 'warning' }
  ],
  '2': [
    { id: 'l4', event: 'Online homework platform', timestamp: 'Yesterday', type: 'safe' },
    { id: 'l5', event: 'Device locked for bedtime', timestamp: 'Yesterday', type: 'safe' }
  ]
};

// --- Main Component ---

export default function App() {
  const [view, setView] = useState<View>('selection');
  const [children, setChildren] = useState<Child[]>(INITIAL_CHILDREN);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [newChildName, setNewChildName] = useState('');

  const selectedChild = children.find(c => c.id === selectedChildId);

  // --- Handlers ---

  const handleAddChild = () => {
    if (!newChildName.trim()) return;
    const newChild: Child = {
      id: Math.random().toString(36).substr(2, 9),
      name: newChildName,
      devices: [],
      isActive: false,
      token: Math.floor(1000 + Math.random() * 9000).toString(),
      settings: {
        mediaFiltering: true,
        linkProtection: true,
        socialFiltering: true,
        screenTime: false
      }
    };
    setChildren([...children, newChild]);
    setNewChildName('');
  };

  const handleToggleSetting = (childId: string, setting: keyof Child['settings']) => {
    setChildren(prev => prev.map(child => {
      if (child.id === childId) {
        return {
          ...child,
          settings: {
            ...child.settings,
            [setting]: !child.settings[setting]
          }
        };
      }
      return child;
    }));
  };

  const handleDeleteChild = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChildren(children.filter(c => c.id !== id));
  };

  const handleDisconnectDevice = (childId: string, deviceId: string) => {
    setChildren(prev => prev.map(child => {
      if (child.id === childId) {
        return {
          ...child,
          devices: child.devices.filter(d => d.id !== deviceId)
        };
      }
      return child;
    }));
  };

  const handleSelectChild = (id: string) => {
    setSelectedChildId(id);
    setView('child-detail');
  };

  // --- Renderers ---

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      <AnimatePresence mode="wait">
        {view === 'selection' && (
          <ModeSelection key="selection" onSelectParent={() => setView('parent-auth')} onSelectChild={() => setView('child-auth')} />
        )}

        {view === 'parent-auth' && (
          <ParentAuth key="parent-auth" onBack={() => setView('selection')} onSuccess={() => setView('parent-dashboard')} />
        )}

        {view === 'parent-dashboard' && (
          <ParentDashboard 
            key="parent-dashboard" 
            childrenList={children}
            onSelectChild={handleSelectChild}
            onDeleteChild={handleDeleteChild}
            onAddChild={handleAddChild}
            newChildName={newChildName}
            setNewChildName={setNewChildName}
            onLogout={() => setView('selection')}
          />
        )}

        {view === 'child-detail' && selectedChild && (
          <ChildDetail 
            key="child-detail" 
            child={selectedChild} 
            logs={MOCK_LOGS[selectedChild.id] || []}
            onBack={() => setView('parent-dashboard')} 
            onToggleSetting={(setting) => handleToggleSetting(selectedChild.id, setting)}
            onDisconnectDevice={(deviceId) => handleDisconnectDevice(selectedChild.id, deviceId)}
          />
        )}

        {view === 'child-auth' && (
          <ChildAuth key="child-auth" onBack={() => setView('selection')} onSuccess={() => setView('child-home')} />
        )}

        {view === 'child-home' && (
          <ChildHome key="child-home" onLogout={() => setView('selection')} />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Sub-components ---

function ModeSelection({ onSelectParent, onSelectChild }: { onSelectParent: () => void, onSelectChild: () => void, key?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen p-6 bg-white"
    >
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-200">
          <Shield className="text-white" size={40} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">SafeGuard</h1>
        <p className="mt-2 text-slate-500">Choose your mode to continue</p>
      </div>

      <div className="grid w-full max-w-sm gap-4">
        <button 
          onClick={onSelectParent}
          className="group relative flex items-center gap-4 p-6 text-left transition-all bg-white border-2 border-slate-100 rounded-3xl hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-50"
        >
          <div className="flex items-center justify-center w-14 h-14 bg-indigo-50 rounded-2xl group-hover:bg-indigo-600 transition-colors">
            <User className="text-indigo-600 group-hover:text-white transition-colors" size={28} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Parent Mode</h3>
            <p className="text-sm text-slate-500">Manage children & settings</p>
          </div>
          <ChevronRight className="ml-auto text-slate-300 group-hover:text-indigo-600" size={20} />
        </button>

        <button 
          onClick={onSelectChild}
          className="group relative flex items-center gap-4 p-6 text-left transition-all bg-white border-2 border-slate-100 rounded-3xl hover:border-emerald-600 hover:shadow-lg hover:shadow-emerald-50"
        >
          <div className="flex items-center justify-center w-14 h-14 bg-emerald-50 rounded-2xl group-hover:bg-emerald-600 transition-colors">
            <Baby className="text-emerald-600 group-hover:text-white transition-colors" size={28} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Child Mode</h3>
            <p className="text-sm text-slate-500">Connect to your guardian</p>
          </div>
          <ChevronRight className="ml-auto text-slate-300 group-hover:text-emerald-600" size={20} />
        </button>
      </div>
    </motion.div>
  );
}

function ParentAuth({ onBack, onSuccess }: { onBack: () => void, onSuccess: () => void, key?: string }) {
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('1234');

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col min-h-screen p-6 bg-white"
    >
      <button onClick={onBack} className="flex items-center gap-2 mb-8 text-slate-500 hover:text-indigo-600 transition-colors">
        <ArrowLeft size={20} />
        <span className="font-medium">Back</span>
      </button>

      <div className="mb-10">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Welcome Back</h2>
        <p className="mt-2 text-slate-500">Enter your credentials to manage your family</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block mb-2 text-sm font-bold text-slate-700">Email Address</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 focus:outline-none transition-all"
            placeholder="admin@gmail.com"
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-bold text-slate-700">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 focus:outline-none transition-all"
            placeholder="••••"
          />
        </div>
        <button 
          onClick={onSuccess}
          className="w-full py-4 mt-4 font-bold text-white bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-[0.98]"
        >
          Login to Dashboard
        </button>
      </div>
    </motion.div>
  );
}

function ParentDashboard({ 
  childrenList, 
  onSelectChild, 
  onDeleteChild, 
  onAddChild, 
  newChildName, 
  setNewChildName,
  onLogout 
}: { 
  childrenList: Child[], 
  onSelectChild: (id: string) => void, 
  onDeleteChild: (id: string, e: React.MouseEvent) => void,
  onAddChild: () => void,
  newChildName: string,
  setNewChildName: (val: string) => void,
  onLogout: () => void,
  key?: string
}) {
  const [qrChild, setQrChild] = useState<Child | null>(null);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="flex flex-col min-h-screen bg-slate-50 relative"
    >
      {/* QR Code Modal */}
      <AnimatePresence>
        {qrChild && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setQrChild(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xs p-8 bg-white rounded-[2.5rem] shadow-2xl text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-center w-16 h-16 bg-indigo-50 rounded-2xl mx-auto mb-6">
                <QrCode className="text-indigo-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{qrChild.name}'s Connection QR</h3>
              <p className="text-xs text-slate-500 mb-8 leading-relaxed">
                Scan this code on the child's device to link it to your account.
              </p>
              
              <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100 mb-8">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrChild.token}`}
                  alt="QR Code"
                  className="w-full aspect-square rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div className="flex flex-col gap-3">
                <div className="py-3 px-4 bg-indigo-50 rounded-xl border border-indigo-100">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block mb-1">Manual Token</span>
                  <span className="text-lg font-black text-indigo-600 tracking-[0.2em]">{qrChild.token}</span>
                </div>
                <button 
                  onClick={() => setQrChild(null)}
                  className="w-full py-4 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="p-6 bg-white border-b border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
              <User className="text-indigo-600" size={24} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Alex Thompson</h2>
              <p className="text-xs font-medium text-slate-500">Premium Guardian Plan</p>
            </div>
          </div>
          <button onClick={onLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-8 overflow-y-auto pb-24">
        {/* Children List */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Connected Children</h3>
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full">{childrenList.length} TOTAL</span>
          </div>
          
          <div className="space-y-3">
            {childrenList.map(child => (
              <motion.div 
                key={child.id}
                layout
                onClick={() => onSelectChild(child.id)}
                className="group relative flex items-center gap-4 p-5 bg-white border border-slate-100 rounded-3xl cursor-pointer hover:border-indigo-200 hover:shadow-md transition-all"
              >
                <div className="relative">
                  <div className="flex items-center justify-center w-14 h-14 bg-slate-50 rounded-2xl">
                    <Baby className="text-slate-400" size={28} />
                  </div>
                  <div className={cn(
                    "absolute -top-1 -right-1 w-4 h-4 border-2 border-white rounded-full",
                    child.isActive ? "bg-emerald-500" : "bg-slate-300"
                  )} />
                </div>
                
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900">{child.name}</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {child.devices.length > 0 ? (
                      child.devices.map(d => (
                        <span key={d.id} className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400">
                          {d.type === 'mobile' && <Smartphone size={10} />}
                          {d.type === 'tablet' && <Tablet size={10} />}
                          {d.type === 'laptop' && <Laptop size={10} />}
                          {d.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] font-bold text-slate-300 italic">No devices linked</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setQrChild(child);
                    }}
                    className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"
                  >
                    <QrCode size={18} />
                  </button>
                  <button 
                    onClick={(e) => onDeleteChild(child.id, e)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                  <ChevronRight className="text-slate-200" size={20} />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Add Child Section */}
        <section className="p-6 bg-white border border-slate-100 rounded-[2.5rem]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Add / Manage Device</h3>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Add a new child to generate a unique connection token. Use this token on their device to start filtering.
          </p>
          
          <div className="flex gap-2">
            <input 
              type="text" 
              value={newChildName}
              onChange={(e) => setNewChildName(e.target.value)}
              className="flex-1 px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-600 focus:outline-none transition-all text-sm font-medium"
              placeholder="Child's Name"
            />
            <button 
              onClick={onAddChild}
              className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
            >
              <Plus size={24} />
            </button>
          </div>

          {childrenList.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-50">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Active Tokens</h4>
              <div className="space-y-3">
                {childrenList.map(child => (
                  <div key={child.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="text-xs font-bold text-slate-600">{child.name}</span>
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono font-bold text-indigo-600 tracking-widest">
                        {child.token}
                      </code>
                      <QrCode size={14} className="text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </motion.div>
  );
}

function ChildDetail({ 
  child, 
  logs, 
  onBack, 
  onToggleSetting,
  onDisconnectDevice
}: { 
  child: Child, 
  logs: LogEntry[], 
  onBack: () => void, 
  onToggleSetting: (setting: keyof Child['settings']) => void,
  onDisconnectDevice: (deviceId: string) => void,
  key?: string 
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col min-h-screen bg-white"
    >
      <header className="p-6 border-b border-slate-100">
        <button onClick={onBack} className="flex items-center gap-2 mb-6 text-slate-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft size={20} />
          <span className="font-medium text-sm">Dashboard</span>
        </button>

        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="flex items-center justify-center w-16 h-16 bg-indigo-50 rounded-2xl">
              <Baby className="text-indigo-600" size={32} />
            </div>
            <div className={cn(
              "absolute -top-1 -right-1 w-5 h-5 border-4 border-white rounded-full",
              child.isActive ? "bg-emerald-500" : "bg-slate-300"
            )} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{child.name}'s Profile</h2>
            <p className="text-xs font-medium text-slate-500">
              {child.isActive ? 'Currently Active' : 'Last seen 2h ago'}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-8 overflow-y-auto">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Connected Devices</h3>
            <Smartphone size={16} className="text-slate-300" />
          </div>
          <div className="flex flex-wrap gap-3">
            {child.devices.map(device => (
              <div key={device.id} className="flex flex-col gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm shadow-slate-100/50 min-w-[140px]">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center w-8 h-8 bg-white rounded-xl border border-slate-100">
                    {device.type === 'mobile' && <Smartphone size={16} className="text-indigo-600" />}
                    {device.type === 'tablet' && <Tablet size={16} className="text-indigo-600" />}
                    {device.type === 'laptop' && <Laptop size={16} className="text-indigo-600" />}
                  </div>
                  <span className="text-xs font-bold text-slate-700">{device.name}</span>
                </div>
                <button 
                  onClick={() => onDisconnectDevice(device.id)}
                  className="w-full py-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-white border border-indigo-100 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
                >
                  Disconnect
                </button>
              </div>
            ))}
            {child.devices.length === 0 && (
              <div className="w-full p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center">
                <p className="text-xs font-medium text-slate-400 italic">No devices currently linked</p>
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Recent Activity</h3>
            <Activity size={16} className="text-slate-300" />
          </div>
          <div className="space-y-3">
            {logs.map(log => (
              <div key={log.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className={cn(
                  "mt-1 w-2 h-2 rounded-full shrink-0",
                  log.type === 'safe' ? 'bg-emerald-500' : 
                  log.type === 'blocked' ? 'bg-red-500' : 'bg-amber-500'
                )} />
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800 leading-tight">{log.event}</p>
                  <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-wider">{log.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Guardian Settings</h3>
            <Settings size={16} className="text-slate-300" />
          </div>
          <div className="grid gap-3">
            <SettingToggle 
              label="Media Filtering" 
              description="Scan images for inappropriate content" 
              active={child.settings.mediaFiltering} 
              onToggle={() => onToggleSetting('mediaFiltering')}
            />
            <SettingToggle 
              label="Link Protection" 
              description="Block known malicious or adult links" 
              active={child.settings.linkProtection} 
              onToggle={() => onToggleSetting('linkProtection')}
            />
            <SettingToggle 
              label="Social Interaction filtering" 
              description="scan texts and messages and share contexts for toxicity." 
              active={child.settings.socialFiltering} 
              onToggle={() => onToggleSetting('socialFiltering')}
            />
            <SettingToggle 
              label="Screen Time" 
              description="Limit daily usage to 2 hours" 
              active={child.settings.screenTime} 
              onToggle={() => onToggleSetting('screenTime')}
            />
          </div>
        </section>
      </main>
    </motion.div>
  );
}

function SettingToggle({ label, description, active = false, onToggle }: { label: string, description: string, active?: boolean, onToggle?: () => void }) {
  return (
    <div 
      onClick={onToggle}
      className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl cursor-pointer hover:border-indigo-200 transition-all"
    >
      <div>
        <h4 className="text-sm font-bold text-slate-900">{label}</h4>
        <p className="text-[10px] font-medium text-slate-400">{description}</p>
      </div>
      <div className={cn(
        "w-10 h-6 rounded-full relative transition-all duration-300",
        active ? "bg-indigo-600 shadow-lg shadow-indigo-100" : "bg-slate-200"
      )}>
        <motion.div 
          animate={{ left: active ? 20 : 4 }}
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
        />
      </div>
    </div>
  );
}

function ChildAuth({ onBack, onSuccess }: { onBack: () => void, onSuccess: () => void, key?: string }) {
  const [token, setToken] = useState('1234');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  const startScanning = async () => {
    try {
      setError(null);
      setIsScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Simulate scanning success after 3 seconds
      setTimeout(() => {
        if (streamRef.current) {
          setToken('8829'); // Simulate a scanned token
          stopScanning();
        }
      }, 3000);
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError("Camera permission denied. Please allow camera access in your browser settings.");
      } else {
        setError("Could not access camera. Please ensure it's not being used by another app.");
      }
      // Don't close scanning immediately so user can see the error
    }
  };

  const simulateScan = () => {
    setToken('8829');
    stopScanning();
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
    setError(null);
  };

  useEffect(() => {
    return () => stopScanning();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col min-h-screen p-6 bg-white relative overflow-hidden"
    >
      <AnimatePresence>
        {isScanning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex flex-col"
          >
            <div className="relative flex-1">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              
              {/* Scanner Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 border-2 border-emerald-500 rounded-3xl relative">
                  <motion.div 
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]"
                  />
                </div>
              </div>

              <button 
                onClick={stopScanning}
                className="absolute top-8 left-8 p-3 bg-white/20 backdrop-blur-md text-white rounded-2xl hover:bg-white/30 transition-all"
              >
                <ArrowLeft size={24} />
              </button>

              {error ? (
                <div className="absolute inset-0 flex items-center justify-center p-8 text-center bg-slate-900/90 backdrop-blur-sm">
                  <div className="max-w-xs">
                    <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Shield className="text-red-500" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Camera Blocked</h3>
                    <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                      {error}
                    </p>
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={startScanning}
                        className="w-full py-4 bg-white text-slate-900 font-bold rounded-2xl hover:bg-slate-100 transition-all"
                      >
                        Try Again
                      </button>
                      <button 
                        onClick={simulateScan}
                        className="w-full py-4 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-all"
                      >
                        Simulate Scan (Demo)
                      </button>
                      <button 
                        onClick={stopScanning}
                        className="w-full py-4 text-slate-500 font-bold hover:text-white transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="absolute bottom-12 left-0 right-0 text-center px-8">
                  <p className="text-white text-sm font-bold tracking-wide mb-2">Align QR Code within the frame</p>
                  <p className="text-white/60 text-xs">Scanning will happen automatically</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={onBack} className="flex items-center gap-2 mb-12 text-slate-500 hover:text-emerald-600 transition-colors">
        <ArrowLeft size={20} />
        <span className="font-medium">Back</span>
      </button>

      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-xs mx-auto">
        <div className="w-20 h-20 mb-8 bg-emerald-50 rounded-[2rem] flex items-center justify-center">
          <Lock className="text-emerald-600" size={40} />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-3">Connect Device</h2>
        <p className="text-slate-500 mb-10">Enter the 4-digit token provided by your guardian</p>

        <div className="w-full space-y-6">
          <input 
            type="text" 
            value={token}
            onChange={(e) => setToken(e.target.value)}
            maxLength={4}
            className="w-full text-center text-4xl font-black tracking-[0.5em] py-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-emerald-600 focus:outline-none transition-all text-emerald-600"
            placeholder="0000"
          />
          
          <button 
            onClick={onSuccess}
            className="w-full py-5 font-bold text-white bg-emerald-600 rounded-3xl shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-[0.98]"
          >
            Connect to Guardian
          </button>

          <button 
            onClick={startScanning}
            className="flex items-center justify-center gap-2 pt-4 text-slate-400 hover:text-emerald-600 transition-colors w-full"
          >
            <QrCode size={20} />
            <span className="text-xs font-bold uppercase tracking-widest">Scan QR Code</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function ChildHome({ onLogout }: { onLogout: () => void, key?: string }) {
  const [isAlerting, setIsAlerting] = useState(false);
  const audioContextRef = React.useRef<AudioContext | null>(null);

  const playAlarm = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.5);
  };

  const handleEmergency = () => {
    setIsAlerting(true);
    // Play sound repeatedly for demo
    const interval = setInterval(playAlarm, 600);
    
    // Simulate sending notification
    setTimeout(() => {
      clearInterval(interval);
      setIsAlerting(false);
      alert("Alert sent to Parent Dashboard!");
    }, 3000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ 
        opacity: 1,
        backgroundColor: isAlerting ? '#ef4444' : '#059669'
      }} 
      className="flex flex-col items-center justify-center min-h-screen p-8 text-white text-center transition-colors duration-300"
    >
      <motion.div 
        animate={{ 
          scale: isAlerting ? [1, 1.2, 1] : 1,
          rotate: isAlerting ? [0, 5, -5, 0] : 0
        }}
        transition={{ repeat: isAlerting ? Infinity : 0, duration: 0.2 }}
        className="w-32 h-32 mb-10 bg-white/20 backdrop-blur-xl rounded-[3rem] flex items-center justify-center border border-white/30"
      >
        <Shield size={64} className="text-white" />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-3xl font-bold mb-4">
          {isAlerting ? "ALERTING PARENT..." : "You're Protected"}
        </h2>
        <p className="text-emerald-50 max-w-xs mx-auto leading-relaxed font-medium">
          {isAlerting 
            ? "Emergency signal is being sent to your guardian's dashboard."
            : "Your data is safely filtering under guardian authorization."}
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-16 flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/10"
      >
        <div className={cn(
          "w-2 h-2 rounded-full animate-pulse",
          isAlerting ? "bg-white" : "bg-emerald-300"
        )} />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">
          {isAlerting ? "Emergency Mode" : "Active Filtering"}
        </span>
      </motion.div>

      <div className="absolute bottom-12 w-full px-8 flex flex-col items-center gap-4">
        <button 
          onClick={handleEmergency}
          disabled={isAlerting}
          className={cn(
            "w-full max-w-xs py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all shadow-xl",
            isAlerting 
              ? "bg-white text-red-600 scale-95" 
              : "bg-red-500 text-white hover:bg-red-600 active:scale-95 shadow-red-900/20"
          )}
        >
          {isAlerting ? "Sending Alert..." : "Emergency Call"}
        </button>
        
        <button 
          onClick={onLogout}
          className="text-white/40 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors"
        >
          Switch Mode
        </button>
      </div>
    </motion.div>
  );
}

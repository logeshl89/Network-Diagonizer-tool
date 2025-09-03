import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal, 
  Play, 
  Download, 
  FileText, 
  Image, 
  Wifi, 
  Globe, 
  Server, 
  Activity,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle,
  X,
  Zap,
  Eye,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface PingLocation {
  geo: string;
  isp: string;
  loss: number;
  sent: number;
  last: number | null;
  avg: number | null;
  best: number | null;
  worst: number | null;
  stdev: number | null;
  status: 'testing' | 'complete' | 'failed';
}

interface DeviceInfo {
  ip: string;
  location: string;
  isp: string;
  asn: string;
  country: string;
  city: string;
  timezone: string;
}

interface TestResult {
  command: string;
  timestamp: string;
  data: any;
  type: 'ping' | 'dig' | 'bgp' | 'traceroute' | 'mtr' | 'whois';
}

interface ModalData {
  isOpen: boolean;
  type: 'mtr' | 'chart' | 'error' | null;
  data?: any;
}

function App() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TestResult | null>(null);
  const [modal, setModal] = useState<ModalData>({ isOpen: false, type: null });
  const [pingLocations, setPingLocations] = useState<PingLocation[]>([]);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [isRealTimePing, setIsRealTimePing] = useState(false);
  const [targetHost, setTargetHost] = useState('google.com');
  const resultsRef = useRef<HTMLDivElement>(null);

  // Initialize global ping locations
  const initializePingLocations = (): PingLocation[] => [
    { geo: 'Canada, BC, Vancouver', isp: 'Shaw', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'USA, CA, Fremont', isp: 'Hurricane', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'USA, CA, Fremont', isp: 'IT7 FMT2', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'USA, CA, Fremont', isp: 'Linode', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'USA, CA, San Francisco', isp: 'Digital Ocean', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'USA, CA, Santa Clara', isp: 'Hurricane', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'USA, CA, Los Angeles', isp: 'Hurricane', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'USA, CA, Los Angeles', isp: 'DMIT', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'USA, CA, Los Angeles', isp: 'Vultr', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'USA, CA, Los Angeles', isp: 'NetActuate', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'USA, WA, Seattle', isp: 'Google', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'USA, CO, Denver', isp: 'Cogent', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'USA, CO, Denver', isp: 'NetActuate', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'USA, TX, Fort Worth', isp: 'AT&T', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'USA, TX, Dallas', isp: 'NetActuate', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'USA, MO, Kansas City', isp: 'Rozint', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'USA, IL, Chicago', isp: 'NetActuate', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'USA, IL, Chicago', isp: 'Infraly', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'USA, NY, Buffalo', isp: 'ColoCrossing', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'USA, VA, Ashburn', isp: 'NetActuate', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'USA, NY, New York', isp: 'Hurricane', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Canada, QC, Montreal', isp: 'OVH', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Chile, Santiago', isp: 'NetActuate', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Paraguay, C.D.E.', isp: 'ASISPY', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Brazil, Sao Paulo', isp: 'NetActuate', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Brazil, Sao Paulo', isp: 'HyperFilter', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Morocco, Fez', isp: 'Hostoweb', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Spain, Madrid', isp: 'NetActuate', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'UK, Manchester', isp: 'NetActuate', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'UK, London', isp: 'Cosmic Global', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'France, Paris', isp: 'Online.net', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'France, Paris', isp: 'NetActuate', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Netherlands, Amsterdam', isp: 'Online.net', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Netherlands, Amsterdam', isp: 'Eranium', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Netherlands, Amsterdam', isp: 'Interhost', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Norway, Sandefjord', isp: 'Gigahost', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Switzerland, Zurich', isp: 'iFog', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Germany, Frankfurt', isp: 'ZetNet', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Germany, Nuremberg', isp: 'NetActuate', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Slovenia, Maribor', isp: 'PipeHost', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Austria, Vienna', isp: 'PipeHost', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Kosovo, Prishtine', isp: 'RS Computers', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Romania, Bucharest', isp: 'ZetNet', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Romania, Bucharest', isp: 'M247', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Turkey, Bursa', isp: 'Oneprovider', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Cyprus, Limassol', isp: 'CL8', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Israel, Tel Aviv', isp: 'Oneprovider', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Israel, Tel Aviv', isp: 'Interhost', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'UAE, Dubai', isp: 'NetActuate', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Iran, Tabriz', isp: 'ArvanCloud', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Iran, Tehran', isp: 'Iranet', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Iran, Tehran', isp: 'MHOST', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'India, Mumbai', isp: 'Vultr', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'India, Bengaluru', isp: 'Digital Ocean', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'India, Chennai', isp: 'NetActuate', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Bangladesh, Jessore', isp: 'Race Online', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Bangladesh, Dhaka', isp: 'Dot Internet', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Bangladesh, Dhaka', isp: 'Summit', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Bangladesh, Dhaka', isp: 'BTCL', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Bangladesh, Dhaka', isp: 'Hello Tech', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Bangladesh, Dhaka', isp: 'Mango', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Bangladesh, Dhaka', isp: 'Spectra', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Bangladesh, Dhaka', isp: 'Layer3', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Bangladesh, Dhaka', isp: 'STT Startrek', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Bangladesh, Dhaka', isp: 'Link3', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Bangladesh, Dhaka', isp: 'Race Online', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Bangladesh, Chittagong', isp: 'Race Online', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Thailand, Bangkok', isp: 'SG.GS', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Singapore', isp: 'Digital Ocean', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Singapore', isp: 'SG.GS', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'South Korea, Seoul', isp: 'Phylaxis', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Japan, Tokyo', isp: 'DODO', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Japan, Tokyo', isp: 'Vultr', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Australia, Sydney', isp: 'Vultr', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'Taiwan, Taichung', isp: 'Google', loss: 0, sent: 0, last: null, avg: null, best: null, worst: null, stdev: null, status: 'testing' },
    { geo: 'China, Chengdu', isp: 'Tencent', loss: 100, sent: 1, last: null, avg: null, best: null, worst: null, stdev: null, status: 'failed' },
    { geo: 'China, Chongqing', isp: 'Tencent', loss: 100, sent: 1, last: null, avg: null, best: null, worst: null, stdev: null, status: 'failed' },
    { geo: 'China, Guiyang', isp: 'Huawei', loss: 100, sent: 1, last: null, avg: null, best: null, worst: null, stdev: null, status: 'failed' },
    { geo: 'China, Guangzhou', isp: 'Tencent', loss: 100, sent: 1, last: null, avg: null, best: null, worst: null, stdev: null, status: 'failed' },
    { geo: 'China, Hubei', isp: 'China Unicom', loss: 100, sent: 1, last: null, avg: null, best: null, worst: null, stdev: null, status: 'failed' },
    { geo: 'China, Nanjing', isp: 'Tencent', loss: 100, sent: 1, last: null, avg: null, best: null, worst: null, stdev: null, status: 'failed' },
    { geo: 'China, Jiangsu', isp: 'China Telecom', loss: 100, sent: 1, last: null, avg: null, best: null, worst: null, stdev: null, status: 'failed' },
    { geo: 'China, Jiangsu', isp: 'China Mobile', loss: 100, sent: 1, last: null, avg: null, best: null, worst: null, stdev: null, status: 'failed' },
    { geo: 'China, Lishui', isp: 'China Telecom', loss: 100, sent: 1, last: null, avg: null, best: null, worst: null, stdev: null, status: 'failed' },
    { geo: 'China, Lishui', isp: 'China Unicom', loss: 100, sent: 1, last: null, avg: null, best: null, worst: null, stdev: null, status: 'failed' },
    { geo: 'China, Lishui', isp: 'China Mobile', loss: 100, sent: 1, last: null, avg: null, best: null, worst: null, stdev: null, status: 'failed' }
  ];

  // Simulate device IP detection
  useEffect(() => {
    const detectDevice = async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDeviceInfo({
        ip: '203.0.113.42',
        location: 'San Francisco, CA, USA',
        isp: 'Cloudflare Inc.',
        asn: 'AS13335',
        country: 'United States',
        city: 'San Francisco',
        timezone: 'America/Los_Angeles'
      });
    };

    detectDevice();
  }, []);

  // Real-time ping simulation
  useEffect(() => {
    if (!isRealTimePing) return;

    const interval = setInterval(() => {
      setPingLocations(prev => prev.map(location => {
        if (location.status === 'failed') return location;

        const newSent = location.sent + 1;
        let newLast: number | null = null;
        let newLoss = 0;

        // Simulate some packet loss occasionally
        if (Math.random() < 0.05) {
          newLoss = Math.floor((location.sent * location.loss + 1) / newSent * 100);
        } else {
          // Generate realistic ping times based on geographic distance
          const baseLatency = location.geo.includes('China') ? 0 : 
                             location.geo.includes('Bangladesh') ? 250 + Math.random() * 50 :
                             location.geo.includes('India') ? 240 + Math.random() * 40 :
                             location.geo.includes('Australia') ? 180 + Math.random() * 20 :
                             location.geo.includes('Japan') ? 140 + Math.random() * 20 :
                             location.geo.includes('Singapore') ? 210 + Math.random() * 30 :
                             location.geo.includes('Europe') || location.geo.includes('UK') || location.geo.includes('Germany') || location.geo.includes('France') || location.geo.includes('Netherlands') ? 90 + Math.random() * 30 :
                             location.geo.includes('Brazil') || location.geo.includes('Chile') ? 110 + Math.random() * 20 :
                             location.geo.includes('Canada') ? 70 + Math.random() * 20 :
                             20 + Math.random() * 60; // USA locations

          newLast = baseLatency + (Math.random() - 0.5) * 10;
          newLoss = location.loss;
        }

        const values = [];
        if (location.last !== null) values.push(location.last);
        if (newLast !== null) values.push(newLast);
        if (location.best !== null) values.push(location.best);
        if (location.worst !== null) values.push(location.worst);

        const newBest = values.length > 0 ? Math.min(...values) : newLast;
        const newWorst = values.length > 0 ? Math.max(...values) : newLast;
        
        // Calculate running average
        const allValues = [];
        if (location.avg !== null && location.sent > 0) {
          // Approximate previous values from average
          for (let i = 0; i < location.sent; i++) {
            allValues.push(location.avg + (Math.random() - 0.5) * 5);
          }
        }
        if (newLast !== null) allValues.push(newLast);
        
        const newAvg = allValues.length > 0 ? allValues.reduce((a, b) => a + b, 0) / allValues.length : null;
        const newStdev = allValues.length > 1 ? Math.sqrt(allValues.reduce((acc, val) => acc + Math.pow(val - (newAvg || 0), 2), 0) / allValues.length) : null;

        return {
          ...location,
          sent: newSent,
          last: newLast,
          avg: newAvg,
          best: newBest,
          worst: newWorst,
          stdev: newStdev,
          loss: newLoss,
          status: 'complete' as const
        };
      }));
    }, 2000 + Math.random() * 1000); // Stagger updates

    return () => clearInterval(interval);
  }, [isRealTimePing]);

  const startRealTimePing = () => {
    setPingLocations(initializePingLocations());
    setIsRealTimePing(true);
  };

  const stopRealTimePing = () => {
    setIsRealTimePing(false);
  };

  const resetPingTest = () => {
    setPingLocations(initializePingLocations());
    setIsRealTimePing(false);
  };

  const generateDigResults = () => {
    const recordTypes = ['A', 'AAAA', 'CNAME', 'MX', 'TXT'];
    return recordTypes.map(type => ({
      type,
      name: targetHost,
      value: type === 'A' ? `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}` :
             type === 'AAAA' ? '2001:db8::1' :
             type === 'CNAME' ? `alias.${targetHost}` :
             type === 'MX' ? `10 mail.${targetHost}` :
             'v=spf1 include:_spf.google.com ~all',
      ttl: Math.floor(Math.random() * 3600 + 300)
    }));
  };

  const generateBgpResults = () => {
    return [
      { asn: 'AS13335', name: 'Cloudflare', routes: Math.floor(Math.random() * 1000 + 500), prefix: '1.1.1.0/24' },
      { asn: 'AS8075', name: 'Microsoft', routes: Math.floor(Math.random() * 800 + 400), prefix: '13.107.42.0/24' },
      { asn: 'AS15169', name: 'Google', routes: Math.floor(Math.random() * 1200 + 600), prefix: '8.8.8.0/24' },
      { asn: 'AS16509', name: 'Amazon', routes: Math.floor(Math.random() * 900 + 450), prefix: '52.95.110.0/24' }
    ];
  };

  const generateTracerouteResults = () => {
    return Array.from({ length: 8 }, (_, i) => ({
      hop: i + 1,
      ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      hostname: i === 0 ? 'gateway.local' : i === 7 ? targetHost : `hop${i}.isp.com`,
      rtt1: (Math.random() * 50 + i * 10).toFixed(2),
      rtt2: (Math.random() * 50 + i * 10).toFixed(2),
      rtt3: (Math.random() * 50 + i * 10).toFixed(2)
    }));
  };

  const generateMtrResults = () => {
    return Array.from({ length: 6 }, (_, i) => ({
      hop: i + 1,
      host: i === 0 ? 'gateway.local' : i === 5 ? targetHost : `hop${i}.network.com`,
      loss: Math.floor(Math.random() * 3),
      sent: 10,
      last: (Math.random() * 40 + i * 8).toFixed(2),
      avg: (Math.random() * 45 + i * 8).toFixed(2),
      best: (Math.random() * 35 + i * 8).toFixed(2),
      worst: (Math.random() * 55 + i * 8).toFixed(2),
      stdev: (Math.random() * 5).toFixed(2)
    }));
  };

  const generateWhoisResults = () => {
    return {
      domain: targetHost,
      registrar: 'Example Registrar LLC',
      created: '1995-08-14',
      updated: '2024-01-15',
      expires: '2025-08-14',
      nameservers: [`ns1.${targetHost}`, `ns2.${targetHost}`],
      status: 'clientTransferProhibited',
      registrant: 'Example Organization'
    };
  };

  const parseCommand = (cmd: string) => {
    const parts = cmd.trim().split(' ');
    const command = parts[0].toLowerCase();
    const target = parts[1] || targetHost;
    return { command, target };
  };

  const runTest = async () => {
    if (!input.trim()) return;

    setLoading(true);
    const { command, target } = parseCommand(input);
    setTargetHost(target);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1500));

    let data;
    let type: TestResult['type'] = 'ping';

    switch (command) {
      case 'dig':
        data = generateDigResults();
        type = 'dig';
        break;
      case 'bgp':
        data = generateBgpResults();
        type = 'bgp';
        break;
      case 'traceroute':
      case 'tracert':
        data = generateTracerouteResults();
        type = 'traceroute';
        break;
      case 'mtr':
        data = generateMtrResults();
        type = 'mtr';
        break;
      case 'whois':
        data = generateWhoisResults();
        type = 'whois';
        break;
      default:
        setModal({ 
          isOpen: true, 
          type: 'error', 
          data: { message: `Unknown command: ${command}. Try dig, bgp, traceroute, mtr, or whois.` }
        });
        setLoading(false);
        return;
    }

    setResults({
      command: input,
      timestamp: new Date().toLocaleString(),
      data,
      type
    });
    setLoading(false);
  };

  const downloadPNG = async () => {
    if (!resultsRef.current) return;
    
    try {
      const canvas = await html2canvas(resultsRef.current, {
        backgroundColor: '#1F2937',
        scale: 2
      });
      const link = document.createElement('a');
      link.download = `network-test-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error generating PNG:', error);
    }
  };

  const downloadPDF = async () => {
    if (!resultsRef.current) return;
    
    try {
      const canvas = await html2canvas(resultsRef.current, {
        backgroundColor: '#1F2937',
        scale: 2
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgWidth = 190;
      const pageHeight = pdf.internal.pageSize.height;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`network-test-${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const renderResultsTable = () => {
    if (!results) return null;

    const { type, data } = results;

    switch (type) {
      case 'dig':
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left py-3 px-4 text-green-400">Type</th>
                  <th className="text-left py-3 px-4 text-green-400">Name</th>
                  <th className="text-left py-3 px-4 text-green-400">Value</th>
                  <th className="text-left py-3 px-4 text-green-400">TTL</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row: any, i: number) => (
                  <tr key={i} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                    <td className="py-3 px-4">
                      <span className="bg-blue-900 text-blue-300 px-2 py-1 rounded text-xs font-mono">
                        {row.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-blue-300">{row.name}</td>
                    <td className="py-3 px-4 font-mono break-all">{row.value}</td>
                    <td className="py-3 px-4">{row.ttl}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'bgp':
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left py-3 px-4 text-green-400">ASN</th>
                  <th className="text-left py-3 px-4 text-green-400">Organization</th>
                  <th className="text-left py-3 px-4 text-green-400">Routes</th>
                  <th className="text-left py-3 px-4 text-green-400">Prefix</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row: any, i: number) => (
                  <tr key={i} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                    <td className="py-3 px-4 font-mono text-purple-300">{row.asn}</td>
                    <td className="py-3 px-4">{row.name}</td>
                    <td className="py-3 px-4">{row.routes.toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono text-blue-300">{row.prefix}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'traceroute':
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left py-3 px-4 text-green-400">Hop</th>
                  <th className="text-left py-3 px-4 text-green-400">IP Address</th>
                  <th className="text-left py-3 px-4 text-green-400">Hostname</th>
                  <th className="text-left py-3 px-4 text-green-400">RTT 1</th>
                  <th className="text-left py-3 px-4 text-green-400">RTT 2</th>
                  <th className="text-left py-3 px-4 text-green-400">RTT 3</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row: any, i: number) => (
                  <tr key={i} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                    <td className="py-3 px-4 font-mono text-yellow-400">{row.hop}</td>
                    <td className="py-3 px-4 font-mono text-blue-300">{row.ip}</td>
                    <td className="py-3 px-4 text-gray-300 break-all">{row.hostname}</td>
                    <td className="py-3 px-4">{row.rtt1} ms</td>
                    <td className="py-3 px-4">{row.rtt2} ms</td>
                    <td className="py-3 px-4">{row.rtt3} ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'mtr':
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left py-3 px-4 text-green-400">Hop</th>
                  <th className="text-left py-3 px-4 text-green-400">Host</th>
                  <th className="text-left py-3 px-4 text-green-400">Loss%</th>
                  <th className="text-left py-3 px-4 text-green-400">Sent</th>
                  <th className="text-left py-3 px-4 text-green-400">Last</th>
                  <th className="text-left py-3 px-4 text-green-400">Avg</th>
                  <th className="text-left py-3 px-4 text-green-400">Best</th>
                  <th className="text-left py-3 px-4 text-green-400">Worst</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row: any, i: number) => (
                  <tr key={i} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                    <td className="py-3 px-4 font-mono text-yellow-400">{row.hop}</td>
                    <td className="py-3 px-4 text-gray-300 break-all">{row.host}</td>
                    <td className="py-3 px-4">
                      <span className={row.loss === 0 ? 'text-green-400' : 'text-red-400'}>
                        {row.loss}%
                      </span>
                    </td>
                    <td className="py-3 px-4">{row.sent}</td>
                    <td className="py-3 px-4">{row.last} ms</td>
                    <td className="py-3 px-4">{row.avg} ms</td>
                    <td className="py-3 px-4 text-green-300">{row.best} ms</td>
                    <td className="py-3 px-4 text-red-300">{row.worst} ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setModal({ isOpen: true, type: 'mtr', data })}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Activity size={16} />
                View Detailed Analysis
              </button>
            </div>
          </div>
        );

      case 'whois':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-green-400 font-semibold mb-3">Domain Information</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-400">Domain:</span> <span className="text-blue-300 font-mono">{data.domain}</span></div>
                  <div><span className="text-gray-400">Registrar:</span> <span className="text-gray-300">{data.registrar}</span></div>
                  <div><span className="text-gray-400">Status:</span> <span className="text-yellow-300">{data.status}</span></div>
                </div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-green-400 font-semibold mb-3">Registration Dates</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-400">Created:</span> <span className="text-gray-300">{data.created}</span></div>
                  <div><span className="text-gray-400">Updated:</span> <span className="text-gray-300">{data.updated}</span></div>
                  <div><span className="text-gray-400">Expires:</span> <span className="text-red-300">{data.expires}</span></div>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-green-400 font-semibold mb-3">Name Servers</h3>
              <div className="space-y-1">
                {data.nameservers.map((ns: string, i: number) => (
                  <div key={i} className="text-blue-300 font-mono text-sm">{ns}</div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderModal = () => {
    if (!modal.isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-600">
            <h3 className="text-lg font-semibold text-white">
              {modal.type === 'mtr' ? 'MTR Detailed Analysis' : 
               modal.type === 'chart' ? 'Performance Chart' : 'Error'}
            </h3>
            <button
              onClick={() => setModal({ isOpen: false, type: null })}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6">
            {modal.type === 'mtr' && modal.data && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-900 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {modal.data.reduce((acc: number, hop: any) => acc + parseFloat(hop.avg), 0).toFixed(2)} ms
                    </div>
                    <div className="text-gray-400 text-sm">Average Total RTT</div>
                  </div>
                  <div className="bg-gray-900 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-400">{modal.data.length}</div>
                    <div className="text-gray-400 text-sm">Total Hops</div>
                  </div>
                  <div className="bg-gray-900 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {Math.max(...modal.data.map((hop: any) => parseFloat(hop.worst))).toFixed(2)} ms
                    </div>
                    <div className="text-gray-400 text-sm">Peak Latency</div>
                  </div>
                </div>
                
                <div className="bg-gray-900 p-4 rounded-lg">
                  <h4 className="text-green-400 font-semibold mb-4">Route Analysis</h4>
                  <div className="space-y-3">
                    {modal.data.map((hop: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-800 rounded">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {hop.hop}
                          </div>
                          <div>
                            <div className="font-mono text-blue-300">{hop.host}</div>
                            <div className="text-xs text-gray-400">Average: {hop.avg} ms</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">
                            <span className="text-green-300">{hop.best} ms</span> / 
                            <span className="text-red-300"> {hop.worst} ms</span>
                          </div>
                          <div className="text-xs text-gray-400">Best / Worst</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {modal.type === 'error' && modal.data && (
              <div className="text-center">
                <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-red-400 mb-2">Command Error</h4>
                <p className="text-gray-300">{modal.data.message}</p>
                <div className="mt-4 text-sm text-gray-400">
                  <p>Supported commands: dig, bgp, traceroute, mtr, whois</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const getLatencyColor = (avg: number | null) => {
    if (avg === null) return 'text-gray-400';
    if (avg < 50) return 'text-green-400';
    if (avg < 100) return 'text-yellow-400';
    if (avg < 200) return 'text-orange-400';
    return 'text-red-400';
  };

  const getStatusIcon = (location: PingLocation) => {
    if (location.status === 'failed' || location.loss === 100) {
      return <X size={14} className="text-red-400" />;
    }
    if (location.status === 'testing') {
      return <div className="animate-spin rounded-full h-3 w-3 border border-blue-400 border-t-transparent" />;
    }
    if (location.loss === 0) {
      return <CheckCircle size={14} className="text-green-400" />;
    }
    return <AlertCircle size={14} className="text-yellow-400" />;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-500 p-2 rounded-lg">
                <Zap size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Ping.pe</h1>
                <p className="text-gray-400 text-sm">Global Network Performance Monitor</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Globe size={16} />
                <span>70+ Locations</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        {/* Device Info Card */}
        {deviceInfo && (
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-6 mb-6 border border-blue-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <Server size={20} className="text-blue-400" />
                  Your Connection Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-300">IP Address:</span>
                    <div className="font-mono text-blue-300 text-lg">{deviceInfo.ip}</div>
                  </div>
                  <div>
                    <span className="text-gray-300">Location:</span>
                    <div className="text-white">{deviceInfo.location}</div>
                  </div>
                  <div>
                    <span className="text-gray-300">ISP:</span>
                    <div className="text-white">{deviceInfo.isp} ({deviceInfo.asn})</div>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                  <MapPin size={24} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Real-time Ping Control */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Activity size={20} className="text-green-400" />
              <h2 className="text-lg font-semibold">Global Ping Test</h2>
              {isRealTimePing && (
                <span className="bg-green-900 text-green-300 px-2 py-1 rounded text-xs animate-pulse">
                  LIVE
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={targetHost}
                onChange={(e) => setTargetHost(e.target.value)}
                placeholder="Enter hostname"
                className="bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-green-400"
                disabled={isRealTimePing}
              />
              {!isRealTimePing ? (
                <button
                  onClick={startRealTimePing}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Play size={16} />
                  Start Test
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={stopRealTimePing}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <X size={16} />
                    Stop
                  </button>
                  <button
                    onClick={resetPingTest}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <RefreshCw size={16} />
                    Reset
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Global Ping Results Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left py-3 px-4 text-green-400">Geo</th>
                  <th className="text-left py-3 px-4 text-green-400">ISP</th>
                  <th className="text-left py-3 px-4 text-green-400">Loss</th>
                  <th className="text-left py-3 px-4 text-green-400">Sent</th>
                  <th className="text-left py-3 px-4 text-green-400">Last</th>
                  <th className="text-left py-3 px-4 text-green-400">Avg</th>
                  <th className="text-left py-3 px-4 text-green-400">Best</th>
                  <th className="text-left py-3 px-4 text-green-400">Worst</th>
                  <th className="text-left py-3 px-4 text-green-400">StDev</th>
                  <th className="text-left py-3 px-4 text-green-400">MTR</th>
                  <th className="text-left py-3 px-4 text-green-400">Chart</th>
                </tr>
              </thead>
              <tbody>
                {pingLocations.map((location, i) => (
                  <tr key={i} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(location)}
                        <span className="text-gray-300">{location.geo}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-blue-300">{location.isp}</td>
                    <td className="py-3 px-4">
                      <span className={location.loss === 0 ? 'text-green-400' : location.loss === 100 ? 'text-red-400' : 'text-yellow-400'}>
                        {location.loss}%
                      </span>
                    </td>
                    <td className="py-3 px-4">{location.sent}</td>
                    <td className={`py-3 px-4 ${getLatencyColor(location.last)}`}>
                      {location.last !== null ? `${location.last.toFixed(2)}` : '–'}
                    </td>
                    <td className={`py-3 px-4 ${getLatencyColor(location.avg)}`}>
                      {location.avg !== null ? `${location.avg.toFixed(2)}` : '–'}
                    </td>
                    <td className={`py-3 px-4 ${getLatencyColor(location.best)}`}>
                      {location.best !== null ? `${location.best.toFixed(2)}` : '–'}
                    </td>
                    <td className={`py-3 px-4 ${getLatencyColor(location.worst)}`}>
                      {location.worst !== null ? `${location.worst.toFixed(2)}` : '–'}
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {location.stdev !== null ? location.stdev.toFixed(2) : '–'}
                    </td>
                    <td className="py-3 px-4">
                      <button 
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        onClick={() => setModal({ isOpen: true, type: 'mtr', data: generateMtrResults() })}
                      >
                        ...
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <button 
                        className="text-purple-400 hover:text-purple-300 transition-colors"
                        onClick={() => setModal({ isOpen: true, type: 'chart', data: location })}
                      >
                        <BarChart3 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Stats */}
          {pingLocations.some(l => l.status === 'complete') && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-400">
                  {pingLocations.filter(l => l.status === 'complete').length}
                </div>
                <div className="text-gray-400 text-sm">Active Locations</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {pingLocations.filter(l => l.avg !== null && l.avg < 100).length}
                </div>
                <div className="text-gray-400 text-sm">Low Latency (&lt;100ms)</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {pingLocations.filter(l => l.loss > 0 && l.loss < 100).length}
                </div>
                <div className="text-gray-400 text-sm">Packet Loss</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-400">
                  {pingLocations.filter(l => l.status === 'failed' || l.loss === 100).length}
                </div>
                <div className="text-gray-400 text-sm">Failed Tests</div>
              </div>
            </div>
          )}
        </div>

        {/* Additional Tools */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Terminal size={20} className="text-green-400" />
            <h2 className="text-lg font-semibold">Network Diagnostic Tools</h2>
          </div>
          
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400">$</div>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !loading && runTest()}
                placeholder="dig google.com, bgp AS13335, traceroute 1.1.1.1, mtr google.com, whois example.com"
                className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-8 pr-4 py-3 font-mono text-sm focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-colors"
                disabled={loading}
              />
            </div>
            <button
              onClick={runTest}
              disabled={loading || !input.trim()}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 font-semibold"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Running...
                </>
              ) : (
                <>
                  <Play size={16} />
                  Run Test
                </>
              )}
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {['dig google.com', 'bgp AS13335', 'mtr 1.1.1.1', 'whois github.com', 'traceroute cloudflare.com'].map((cmd) => (
              <button
                key={cmd}
                onClick={() => setInput(cmd)}
                className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded text-xs transition-colors"
                disabled={loading}
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>

        {/* Additional Tool Results */}
        {(loading || results) && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 mb-6">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity size={20} className="text-blue-400" />
                  <h2 className="text-lg font-semibold">Tool Results</h2>
                  {results && (
                    <span className="bg-green-900 text-green-300 px-2 py-1 rounded text-xs">
                      {results.timestamp}
                    </span>
                  )}
                </div>
                
                {results && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={downloadPNG}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
                    >
                      <Image size={14} />
                      PNG
                    </button>
                    <button
                      onClick={downloadPDF}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
                    >
                      <FileText size={14} />
                      PDF
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div ref={resultsRef} className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-2 border-green-400 border-t-transparent mx-auto mb-4" />
                  <p className="text-gray-400">Running network diagnostic...</p>
                  <p className="text-sm text-gray-500 mt-2">Analyzing network infrastructure</p>
                </div>
              ) : results ? (
                <div>
                  <div className="mb-4 p-3 bg-gray-900 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">Command:</span>
                      <span className="font-mono text-green-300">{results.command}</span>
                    </div>
                  </div>
                  {renderResultsTable()}
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Info Cards */}
        {!results && !loading && !isRealTimePing && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-green-400 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <Wifi className="text-blue-400" size={24} />
                <h3 className="font-semibold">Global Ping</h3>
              </div>
              <p className="text-gray-400 text-sm">Test connectivity and latency from 70+ global locations in real-time.</p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-green-400 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <Globe className="text-purple-400" size={24} />
                <h3 className="font-semibold">DNS Lookup</h3>
              </div>
              <p className="text-gray-400 text-sm">Query DNS records including A, AAAA, MX, TXT, and CNAME records.</p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-green-400 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <Server className="text-yellow-400" size={24} />
                <h3 className="font-semibold">Network Analysis</h3>
              </div>
              <p className="text-gray-400 text-sm">Analyze BGP routes, traceroute paths, and MTR diagnostics.</p>
            </div>
          </div>
        )}
      </main>

      {renderModal()}
    </div>
  );
}

export default App;
"use client";

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { UploadArea } from '@/components/UploadArea';
import { ActivityList } from '@/components/ActivityList';
import { StatsCard } from '@/components/StatsCard';
import { BannerAd } from '@/components/BannerAd';
import { Clock, BookOpen, Sparkles, MonitorPlay, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState({
    totalDocuments: 0,
    completedAnalyses: 0,
  });

  useEffect(() => {
    fetchUserData();
    fetchStats();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        const data = await response.json();
        setUserName(data.user?.full_name || data.user?.email?.split('@')[0] || 'Kullanıcı');
      }
    } catch (error) {
      console.error('Failed to fetch user data', error);
      setUserName('Kullanıcı');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/documents');
      if (response.ok) {
        const data = await response.json();
        const completed = data.documents?.filter((d: any) => d.analysis_status === 'completed').length || 0;
        setStats({
          totalDocuments: data.documents?.length || 0,
          completedAnalyses: completed,
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats', error);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header />

      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 flex items-center gap-2">
              Hoş geldin, {userName} <Sparkles className="w-6 h-6 text-yellow-400" />
            </h1>
            <p className="text-muted-foreground mt-1">Bugün hangi bilgileri zekaya dönüştürmek istersin?</p>
          </div>
          <div className="flex items-center space-x-4 bg-secondary/30 px-4 py-2 rounded-full border border-border/50 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-muted-foreground">{stats.completedAnalyses} Aktif Analiz</span>
            </div>
          </div>
        </div>

        {/* Presentation Feature (Odak Özellik) */}
        <div className="relative group overflow-hidden bg-gradient-to-br from-indigo-600/20 via-primary/10 to-transparent border border-primary/20 rounded-3xl p-8 transition-all hover:border-primary/40">
          {/* Decorative UI elements */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center space-x-2 bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <MonitorPlay className="w-4 h-4" />
                <span>Akademik Araçlar</span>
              </div>
              <h2 className="text-3xl font-bold">Akademik Sunum Üret</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Analiz edilen makalelerinizden saniyeler içinde profesyonel sunum taslakları oluşturun.
                <span className="block mt-2 text-sm text-primary/80 italic font-medium">
                  * Bu özellik mevcut analiz paketlerinizi kullanarak çalışır, ek yükleme gerektirmez.
                </span>
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/sunum-uret"
                  className="group/btn bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all flex items-center shadow-lg shadow-primary/20"
                >
                  Sunum Oluştur
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative w-64 h-64 flex items-center justify-center">
                <div className="absolute inset-0 bg-primary/5 rounded-full border border-primary/10 animate-[spin_10s_linear_infinite]" />
                <div className="relative bg-card border border-border p-6 rounded-2xl shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                  <div className="space-y-2">
                    <div className="w-32 h-2 bg-primary/20 rounded" />
                    <div className="w-24 h-2 bg-muted rounded" />
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <div className="h-12 bg-secondary/50 rounded-lg" />
                      <div className="h-12 bg-secondary/50 rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="pt-4">
          <UploadArea />
        </div>

        {/* Reklam Banner - Upload ile Aktiviteler arası */}
        <BannerAd variant="horizontal" slot={0} />

        {/* Bottom Section: Activities & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <ActivityList />
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 gap-4">
            <StatsCard
              title="Analiz Edilen"
              value={stats.totalDocuments.toString()}
              trend={stats.totalDocuments > 0 ? `${stats.completedAnalyses} başarılı` : ''}
              description="Toplam Analiz"
              icon={BookOpen}
            />
            <StatsCard
              title="Dönüştürme Oranı"
              value={stats.totalDocuments > 0 ? `%${Math.round((stats.completedAnalyses / stats.totalDocuments) * 100)}` : '0'}
              trend="Akademik Verim"
              description="Başarı katsayısı"
              icon={Clock}
            />
            {/* Stats altı compact banner */}
            <BannerAd variant="compact" slot={2} />
          </div>
        </div>
      </div>
    </div>
  );
}
